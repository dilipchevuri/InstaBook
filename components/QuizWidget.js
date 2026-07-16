import { useState } from "react";

export default function QuizWidget({ slug, questions }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.reduce(
    (acc, ans, i) => acc + (ans === questions[i].correctIndex ? 1 : 0),
    0
  );

  async function handleSubmit() {
    setSubmitted(true);
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, score, total: questions.length, answers }),
      });
    } catch (_) {
      // Non-critical: quiz result still shows even if logging fails.
    }
  }

  return (
    <div className="space-y-8">
      {questions.map((q, qi) => (
        <div key={qi} className="border border-line reading-border rounded-sm p-5">
          <div className="font-body font-medium text-ink reading-heading mb-3">
            {qi + 1}. {q.question}
          </div>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = submitted && oi === q.correctIndex;
              const isWrongSelected = submitted && isSelected && oi !== q.correctIndex;
              return (
                <button
                  key={oi}
                  disabled={submitted}
                  onClick={() => {
                    const next = [...answers];
                    next[qi] = oi;
                    setAnswers(next);
                  }}
                  className={[
                    "text-left px-4 py-2 rounded-sm border text-sm transition-colors reading-heading",
                    isCorrect ? "border-sage bg-sage/10 text-sage" : "",
                    isWrongSelected ? "border-stamp bg-stamp/10 text-stamp" : "",
                    !submitted && isSelected ? "border-brass bg-brass/10" : "",
                    !submitted && !isSelected ? "border-line reading-border hover:border-brass" : "",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p className="mt-3 text-sm text-inkmuted reading-muted font-body italic">{q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={answers.includes(null)}
          className="font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-ink to-indigo text-paper px-6 py-3 rounded-sm disabled:opacity-40 shadow-sm"
        >
          Submit answers
        </button>
      ) : (
        <div className="font-display text-2xl text-ink reading-heading">
          Score: {score} / {questions.length}
        </div>
      )}
    </div>
  );
}
