import { fetchNews } from "../../../lib/fetchNews";
import { generateDailyDigest, flattenDigestToText, generateStaticCapsules, generateQuiz, generateInstagramCaption } from "../../../lib/ai";
import { publishToInstagram } from "../../../lib/instagram";
import { getServiceClient } from "../../../lib/supabaseClient";

function todaySlug(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async function handler(req, res) {
  // Protect this route — only GitHub Actions (or you) with the secret can trigger it.
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const today = new Date();
  const dateStr = todaySlug(today);
  const log = { steps: [] };
  let supabase;

  try {
    supabase = getServiceClient();

    // 1. Collect news
    const { items, feedErrors } = await fetchNews();
    log.steps.push({ step: "fetch_news", count: items.length, feedErrors });
    if (items.length === 0) {
      throw new Error("No news items collected from any feed today");
    }

    // 2. Generate the structured digest (one entry per news item, not one big blob)
    const digest = await generateDailyDigest(items, dateStr);
    const flatText = flattenDigestToText(digest);
    const title = `GS Daily Digest — ${dateStr}`;
    log.steps.push({ step: "generate_note", ok: true, sections: digest.sections?.length || 0 });

    // 3. Save note
    const { data: noteRow, error: noteErr } = await supabase
      .from("notes")
      .upsert(
        {
          slug: dateStr,
          date: dateStr,
          title,
          content_json: digest,
          content_md: flatText, // kept as a plain-text fallback (search, meta descriptions, etc.)
          sources: items,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();
    if (noteErr) throw noteErr;
    log.steps.push({ step: "save_note", id: noteRow.id });

    // 3b. Generate + save today's static capsule (one per core UPSC subject, separate from current affairs)
    const { data: pastCapsules } = await supabase
      .from("capsules")
      .select("content_json")
      .lt("slug", dateStr)
      .order("slug", { ascending: false })
      .limit(14);

    const recentTopics = {};
    for (const row of pastCapsules || []) {
      for (const c of row.content_json?.capsules || []) {
        if (!c.subject || !c.topic) continue;
        recentTopics[c.subject] = recentTopics[c.subject] || [];
        if (!recentTopics[c.subject].includes(c.topic)) recentTopics[c.subject].push(c.topic);
      }
    }

    const capsuleData = await generateStaticCapsules(dateStr, items, recentTopics);
    const { error: capsuleErr } = await supabase.from("capsules").upsert(
      {
        slug: dateStr,
        date: dateStr,
        content_json: capsuleData,
      },
      { onConflict: "slug" }
    );
    if (capsuleErr) throw capsuleErr;
    log.steps.push({ step: "save_capsules", count: capsuleData.capsules?.length || 0 });

    // 4. Generate + save quiz
    const quiz = await generateQuiz(flatText, dateStr);
    const { error: quizErr } = await supabase.from("quizzes").upsert(
      {
        note_id: noteRow.id,
        slug: dateStr,
        date: dateStr,
        questions: quiz.questions,
      },
      { onConflict: "slug" }
    );
    if (quizErr) throw quizErr;
    log.steps.push({ step: "save_quiz", count: quiz.questions.length });

    // 5. Instagram — caption + image (image is rendered by /api/og/[slug]) + publish
    let igResult = null;
    try {
      const caption = await generateInstagramCaption(flatText, dateStr);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL; // e.g. https://your-site.vercel.app
      const imageUrl = `${siteUrl}/api/og/${dateStr}`;
      igResult = await publishToInstagram({ imageUrl, caption });
      log.steps.push({ step: "instagram_publish", ok: true, id: igResult.id });
    } catch (igError) {
      // Instagram failing should not roll back the website content.
      log.steps.push({ step: "instagram_publish", ok: false, error: igError.message });
    }

    await supabase.from("run_logs").insert({
      run_date: dateStr,
      status: igResult ? "success" : "partial",
      details: log,
    });

    return res.status(200).json({ ok: true, dateStr, log });
  } catch (err) {
    console.error("Daily automation failed:", err);
    if (supabase) {
      try {
        await supabase.from("run_logs").insert({
          run_date: dateStr,
          status: "failed",
          details: { error: err.message, log },
        });
      } catch (logErr) {
        console.error("Also failed to write run_logs:", logErr);
      }
    }
    return res.status(500).json({ ok: false, error: err.message, log });
  }
}
