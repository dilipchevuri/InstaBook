import { getServiceClient } from "../../../lib/supabaseClient";
import { translateContent } from "../../../lib/ai";

const VALID_LANGS = ["te", "hi"];

export default async function handler(req, res) {
  const { slug } = req.query;
  const lang = req.query.lang;
  const type = req.query.type === "capsule" ? "capsule" : "note";

  if (!VALID_LANGS.includes(lang)) {
    return res.status(400).json({ error: "lang must be 'te' or 'hi'" });
  }

  const table = type === "capsule" ? "capsules" : "notes";
  const supabase = getServiceClient();

  try {
    const { data: row, error } = await supabase
      .from(table)
      .select("id, content_json, translations")
      .eq("slug", slug)
      .single();

    if (error || !row) {
      return res.status(404).json({ error: "Not found" });
    }

    // Serve from cache if we've already translated this day into this language.
    const cached = row.translations?.[lang];
    if (cached) {
      return res.status(200).json({ content: cached, cached: true });
    }

    const translated = await translateContent(row.content_json, lang);

    const nextTranslations = { ...(row.translations || {}), [lang]: translated };
    await supabase.from(table).update({ translations: nextTranslations }).eq("id", row.id);

    return res.status(200).json({ content: translated, cached: false });
  } catch (err) {
    console.error("Translation failed:", err);
    return res.status(500).json({ error: err.message });
  }
}
