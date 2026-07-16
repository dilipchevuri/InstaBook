import { useEffect, useRef, useState } from "react";

const MODES = [
  {
    id: "light",
    label: "Light",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    id: "sepia",
    label: "Sepia",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Dark",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

export default function ReadingModeToggle() {
  const [mode, setMode] = useState("light");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("reading-mode") || "light";
    applyMode(saved);
    setMode(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function applyMode(next) {
    document.body.classList.remove("mode-sepia", "mode-dark");
    if (next === "sepia") document.body.classList.add("mode-sepia");
    if (next === "dark") document.body.classList.add("mode-dark");
  }

  function handleSelect(next) {
    setMode(next);
    applyMode(next);
    window.localStorage.setItem("reading-mode", next);
    setOpen(false);
  }

  const current = MODES.find((m) => m.id === mode) || MODES[0];

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 border border-line reading-border rounded-full pl-3 pr-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-inkmuted reading-muted hover:border-brass hover:text-brass transition-colors"
      >
        {current.icon}
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-paper reading-surface border border-line reading-border rounded-lg shadow-lg overflow-hidden z-50 py-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className={[
                "flex items-center gap-2 w-full px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors text-left",
                mode === m.id ? "text-brass" : "text-inkmuted reading-muted hover:text-brass",
              ].join(" ")}
            >
              {m.icon}
              {m.label}
              {mode === m.id && <span className="ml-auto">•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
