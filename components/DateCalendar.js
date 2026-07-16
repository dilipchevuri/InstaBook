import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

function toSlug(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// type: "note" | "capsule" — controls which base path dates link to.
// availableDates: array of "YYYY-MM-DD" strings that actually have content.
// activeDate: the date currently being viewed (defaults calendar to that month).
export default function DateCalendar({ type, availableDates = [], activeDate }) {
  const router = useRouter();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const available = new Set(availableDates);
  const base = activeDate ? new Date(activeDate + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [...Array(firstDayOfWeek).fill(null), ...Array(daysInMonth)].map(
    (v, i) => (v === null ? null : i - firstDayOfWeek + 1)
  );

  const todaySlug = toSlug(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const path = type === "capsule" ? "/capsules" : "/notes";

  function goToDate(slug) {
    setOpen(false);
    router.push(`${path}/${slug}`);
  }

  function shiftMonth(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1.5 border border-line reading-border rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-inkmuted reading-muted hover:border-brass hover:text-brass transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        Calendar
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-paper reading-surface border border-line reading-border rounded-lg shadow-lg z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => shiftMonth(-1)}
              className="p-1 rounded hover:bg-line/40 text-inkmuted reading-muted"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="font-mono text-xs uppercase tracking-wider text-ink reading-heading">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={() => shiftMonth(1)}
              className="p-1 rounded hover:bg-line/40 text-inkmuted reading-muted"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d, i) => (
              <div key={i} className="text-center font-mono text-[10px] text-inkmuted reading-muted">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const slug = toSlug(viewYear, viewMonth, day);
              const hasContent = available.has(slug);
              const isActive = slug === activeDate;
              const isToday = slug === todaySlug;
              return (
                <button
                  key={i}
                  disabled={!hasContent}
                  onClick={() => goToDate(slug)}
                  className={[
                    "aspect-square rounded-full text-xs flex items-center justify-center transition-colors",
                    hasContent ? "cursor-pointer hover:bg-brass hover:text-paper text-ink reading-heading font-medium" : "text-inkmuted reading-muted opacity-30 cursor-default",
                    isActive ? "bg-brass text-paper" : "",
                    isToday && !isActive ? "ring-1 ring-brass" : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <a
            href={type === "capsule" ? "/capsules/archive" : "/archive"}
            className="block mt-3 pt-2 border-t border-line reading-border text-center font-mono text-[10px] uppercase tracking-wider text-inkmuted reading-muted hover:text-brass"
          >
            Full archive →
          </a>
        </div>
      )}
    </div>
  );
}
