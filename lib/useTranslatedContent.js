import { useEffect, useState } from "react";

// type: "note" | "capsule". slug: the day's slug. originalContent: the English content_json.
export function useTranslatedContent(slug, type, originalContent) {
  const [lang, setLangState] = useState("en");
  const [content, setContent] = useState(originalContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("site-lang") || "en";
    if (saved !== "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (lang === "en" || !slug) {
      setContent(originalContent);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/translate/${slug}?lang=${lang}&type=${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.content) {
          setContent(data.content);
        } else {
          setError(data.error || "Translation failed");
          setContent(originalContent);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setContent(originalContent);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, slug, type]);

  function setLang(next) {
    setLangState(next);
    window.localStorage.setItem("site-lang", next);
  }

  return { lang, setLang, content, loading, error };
}
