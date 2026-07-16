import { getServiceClient } from "../../../lib/supabaseClient";

// Logs anonymous quiz results so you can see aggregate performance later
// (e.g. "60% get question 3 wrong" -> that topic needs more coverage).
// No login required — score is computed on the client; this just records it.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { slug, score, total, answers } = req.body || {};
  if (!slug || typeof score !== "number" || typeof total !== "number") {
    return res.status(400).json({ error: "slug, score, total are required" });
  }

  try {
    const supabase = getServiceClient();
    await supabase.from("quiz_attempts").insert({
      slug,
      score,
      total,
      answers: answers || null,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Non-critical — don't block the user's quiz experience if logging fails.
    return res.status(200).json({ ok: false, error: err.message });
  }
}
