// Uses Google's Gemini API (free tier — no billing needed for this project's volume).
// Get a key at https://aistudio.google.com/apikey — takes 1 minute, no credit card.
const MODEL = "gemini-2.5-flash"; // free-tier eligible, generous daily limit
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function callGemini({ system, user, maxTokens = 2000 }) {
  const res = await fetch(`${API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // otherwise "thinking" silently eats the token budget
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n");
  if (!text) {
    throw new Error(`Gemini returned no text: ${JSON.stringify(data)}`);
  }
  return text.trim();
}

const CATEGORIES = [
  "Polity & Governance",
  "Economy",
  "International Relations",
  "Environment & Ecology",
  "Science & Tech",
  "Society",
  "Miscellaneous",
];

export async function generateDailyDigest(newsItems, dateStr) {
  const digestInput = newsItems
    .map((i) => `- [${i.source}] ${i.title}: ${i.summary}`)
    .join("\n");

  const system = `You are structuring today's UPSC/civil-services General Studies (GS) current-affairs digest.
Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "sections": [
    {
      "category": "one of: ${CATEGORIES.join(" | ")}",
      "items": [
        {
          "title": "short exam-style headline, under 90 characters, no trailing period",
          "summary": "one crisp teaser line shown in the list view, under 140 characters",
          "points": ["3-6 short bullet points expanding the story: what happened, why it matters, key facts/figures, exam relevance"],
          "prelimsPointer": "one short fact-based note on the specific name/figure/scheme/date most likely to be tested objectively in Prelims from this item, or null if not prelims-relevant",
          "mainsAngle": "one sentence naming the mains answer-writing theme this could become, or null if not mains-worthy"
        }
      ]
    }
  ],
  "quickRecall": ["5 one-line facts phrased as recall triggers: term - one-line definition/fact"]
}
Rules:
- Only include a category section if there is at least one genuinely distinct news item for it.
- Treat each substantively different development as its own item — do not merge unrelated stories into one item, and do not split one story into duplicates.
- Every point must be in your own words, never copied source wording.
- Keep "points" scannable: short phrases or single sentences, not paragraphs.
- prelimsPointer and mainsAngle serve different purposes: prelimsPointer is a single objective fact worth memorizing; mainsAngle is an analytical theme worth writing about. Fill in whichever genuinely applies — not every item needs both.`;

  const user = `Today's date: ${dateStr}\nRaw headlines and snippets collected today:\n\n${digestInput}\n\nProduce today's structured GS digest as JSON.`;

  const raw = await callGemini({ system, user, maxTokens: 16000 });
  const digest = extractJson(raw, "Daily digest");

  // Assign stable, unique, URL-safe ids ourselves rather than trusting the model —
  // guarantees no collisions and predictable routing (/notes/[date]/[itemId]).
  const slugify = (s) =>
    s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  for (const section of digest.sections || []) {
    const base = slugify(section.category);
    section.items = (section.items || []).map((item, i) => ({
      id: `${base}-${i + 1}`,
      ...item,
    }));
  }

  return digest;
}

// Flattens the structured digest into plain text — used as input for the quiz
// generator and the Instagram caption writer, which just need readable text.
export function flattenDigestToText(digest) {
  const lines = [];
  for (const section of digest.sections || []) {
    lines.push(`## ${section.category}`);
    for (const item of section.items || []) {
      lines.push(`- ${item.title}: ${item.summary}`);
      for (const p of item.points || []) lines.push(`  - ${p}`);
      if (item.prelimsPointer) lines.push(`  Prelims pointer: ${item.prelimsPointer}`);
      if (item.mainsAngle) lines.push(`  Mains angle: ${item.mainsAngle}`);
    }
  }
  if (digest.quickRecall?.length) {
    lines.push("## Quick Recall");
    digest.quickRecall.forEach((r) => lines.push(`- ${r}`));
  }
  return lines.join("\n");
}

function extractJson(raw, label) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${label} returned no parseable JSON. Raw response: ${raw.slice(0, 500)}`);
  }
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    throw new Error(`${label} JSON parse failed: ${e.message}. Raw response: ${raw.slice(0, 500)}`);
  }
}

const STATIC_SUBJECTS = [
  "Polity",
  "Economy",
  "History",
  "Geography",
  "Environment & Ecology",
  "Science & Tech",
  "Art & Culture",
];

export async function generateStaticCapsules(dateStr, newsItems = [], recentTopics = {}) {
  const newsContext = newsItems.map((i) => `- ${i.title}`).join("\n");

  const recentTopicsText = STATIC_SUBJECTS.map((subj) => {
    const used = recentTopics[subj];
    return used?.length ? `- ${subj}: already covered recently — ${used.join("; ")}` : `- ${subj}: no recent history, any topic is fine`;
  }).join("\n");

  const system = `You are creating today's "Static Capsule" — a short daily revision capsule for UPSC Prelims & Mains, one per core static subject (the fixed syllabus, not current affairs).
Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "capsules": [
    {
      "subject": "one of: ${STATIC_SUBJECTS.join(" | ")}",
      "topic": "a specific, well-established static topic within that subject, as a short title",
      "points": ["4-7 short, high-yield revision points — crisp facts, definitions, or classifications, written for quick recall"],
      "pyqNote": "one line describing the pattern/theme of a past UPSC Prelims or Mains question this topic resembles (describe the theme generally — do not quote or invent an exact question)",
      "currentNote": "one line connecting this static topic to a real, recent development from the news list below, or null if none genuinely connects",
      "question": {
        "question": "one prelims-style MCQ testing this exact topic",
        "options": ["4 options"],
        "correctIndex": 0,
        "explanation": "one or two sentence explanation of the correct answer"
      }
    }
  ]
}
Rules:
- Exactly one capsule per subject, covering all ${STATIC_SUBJECTS.length} subjects listed, every day.
- Content must stay strictly within standard, well-established UPSC syllabus material — the kind found in NCERTs and standard reference books (e.g. Laxmikanth for Polity, Ramesh Singh for Economy, Spectrum for Modern History, standard NCERT Geography/Environment texts). Never invent facts, statistics, or events.
- Pick a different specific topic within each subject than a generic "overview" — be specific (e.g. "Directive Principles of State Policy" not just "Indian Constitution").
- CRITICAL: you MUST pick a genuinely different topic than any listed as "already covered recently" below for that subject — cycle through the syllabus systematically (e.g. after Fundamental Rights, move to Fundamental Duties, then DPSP, then Amendment Procedure, then Federalism, etc.) rather than defaulting to the same well-known topic every time.
- Keep every point to one short line — no paragraphs.
- currentNote should only be filled if a real, genuine connection exists in the provided news; otherwise use null rather than forcing a weak link.

Recent topic history (avoid repeating these):
${recentTopicsText}`;

  const user = `Today's date: ${dateStr}\n\nToday's news headlines (for optional current-affairs linking only):\n${newsContext || "(none available)"}\n\nGenerate today's static capsules.`;

  const raw = await callGemini({ system, user, maxTokens: 8000 });
  const result = extractJson(raw, "Static capsules");

  // Stable slug per capsule for anchor links / future routing.
  const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  result.capsules = (result.capsules || []).map((c) => ({ id: slugify(c.subject), ...c }));

  return result;
}

export async function generateQuiz(noteMarkdown, dateStr) {
  const system = `You create a 5-question multiple choice quiz strictly based on the GS digest text given to you.
Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "questions": [
    {
      "question": "string",
      "options": ["string","string","string","string"],
      "correctIndex": 0,
      "explanation": "one or two sentence explanation of the correct answer"
    }
  ]
}
Rules: exactly 5 questions, exactly 4 options each, correctIndex is 0-based, questions must be answerable purely from the digest text, vary difficulty, no duplicate questions.`;

  const user = `Digest date: ${dateStr}\n\nDigest text:\n${noteMarkdown}`;

  const raw = await callGemini({ system, user, maxTokens: 4000 });
  return extractJson(raw, "Quiz generation");
}

export async function generateInstagramCaption(noteMarkdown, dateStr) {
  const system = `You write a punchy Instagram caption (not the image, just the caption text) summarizing a daily UPSC current-affairs digest.
Rules: 2-4 short lines, hook first line, plain language, end with 6-10 relevant hashtags (mix of broad like #UPSC #CurrentAffairs and specific to today's topics). No markdown, no emojis overload (max 3 emojis total).`;
  const user = `Date: ${dateStr}\n\nDigest:\n${noteMarkdown}`;

  return callGemini({ system, user, maxTokens: 400 });
}
