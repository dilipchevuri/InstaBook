import { useEffect, useRef, useState } from "react";

const LANGS = [
  { id: "en", label: "English" },
  { id: "te", label: "తెలుగు" },
  { id: "hi", label: "हिंदी" },
];

export default function LanguageToggle({ lang, setLang, loading }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGS.find((l) => l.id === lang) || LANGS[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 border border-line reading-border rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-inkmuted reading-muted hover:border-brass hover:text-brass transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
        {loading ? "…" : current.id.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-paper reading-surface border border-line reading-border rounded-lg shadow-lg overflow-hidden z-50 py-1">
          {LANGS.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id);
                setOpen(false);
              }}
              className={[
                "flex items-center w-full px-3 py-2 font-body text-sm transition-colors text-left",
                lang === l.id ? "text-brass" : "text-inkmuted reading-muted hover:text-brass",
              ].join(" ")}
            >
              {l.label}
              {lang === l.id && <span className="ml-auto">•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
