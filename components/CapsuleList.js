import { useState } from "react";
import { categoryClass } from "../lib/categories";

function CapsuleQuestion({ question }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  if (!question) return null;

  return (
    <div className="mt-4 pt-4 border-t border-line reading-border">
      <div className="font-mono text-[0.65rem] uppercase tracking-widest text-inkmuted reading-muted mb-2">
        Quick check
      </div>
      <p className="text-sm font-medium text-ink reading-heading mb-3">{question.question}</p>
      <div className="grid gap-2">
        {question.options.map((opt, i) => {
          const isCorrect = revealed && i === question.correctIndex;
          const isWrongPick = revealed && selected === i && i !== question.correctIndex;
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => {
                setSelected(i);
                setRevealed(true);
              }}
              className={[
                "text-left px-3 py-1.5 rounded-sm border text-sm transition-colors reading-heading",
                isCorrect ? "border-sage bg-sage/10 text-sage" : "",
                isWrongPick ? "border-stamp bg-stamp/10 text-stamp" : "",
                !revealed ? "border-line reading-border hover:border-brass" : "",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <p className="text-xs text-inkmuted reading-muted italic mt-2">{question.explanation}</p>
      )}
    </div>
  );
}

export default function CapsuleList({ digest }) {
  if (!digest?.capsules?.length) {
    return (
      <p className="text-inkmuted reading-muted">
        No capsule available for this day — it may predate this feature.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {digest.capsules.map((c) => {
        const cls = categoryClass(c.subject);
        return (
          <div key={c.id} className={`capsule-card ${cls} rounded-sm p-5 border border-line reading-border`}>
            <div className={`digest-heading ${cls} font-mono text-[0.7rem] uppercase tracking-widest mb-2`}>
              {c.subject}
            </div>
            <h3 className="font-display text-lg font-semibold text-ink reading-heading mb-3">
              {c.topic}
            </h3>
            <ul className="grid gap-1.5 mb-4">
              {(c.points || []).map((p, i) => (
                <li key={i} className={`digest-point ${cls} text-sm text-inkmuted reading-muted leading-relaxed pl-5 relative`}>
                  {p}
                </li>
              ))}
            </ul>

            {c.pyqNote && (
              <p className="text-xs text-inkmuted reading-muted italic mb-1">
                <span className="not-italic font-mono uppercase tracking-wide text-[0.65rem]">PYQ pattern:</span> {c.pyqNote}
              </p>
            )}
            {c.currentNote && (
              <p className="text-xs text-inkmuted reading-muted italic">
                <span className="not-italic font-mono uppercase tracking-wide text-[0.65rem]">Current link:</span> {c.currentNote}
              </p>
            )}

            <CapsuleQuestion question={c.question} />
          </div>
        );
      })}
    </div>
  );
}
