import Link from "next/link";
import { categoryClass } from "../lib/categories";

export default function DigestList({ dateSlug, digest }) {
  if (!digest?.sections?.length) {
    return (
      <div className="border border-line reading-border rounded-sm p-6 text-sm text-inkmuted reading-muted">
        This day's digest was generated before the current site format and isn't available to display.
        Newer days (generated after this update) will show up here normally.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {digest.sections.map((section) => (
        <section key={section.category}>
          <h2 className={`digest-heading ${categoryClass(section.category)} font-display text-xl font-semibold mb-4`}>
            {section.category}
          </h2>
          <div className="grid gap-3">
            {section.items.map((item) => (
              <Link
                key={item.id}
                href={`/notes/${dateSlug}/${item.id}`}
                className={`digest-card ${categoryClass(section.category)} block border border-line reading-border rounded-sm p-4 hover:border-brass transition-colors`}
              >
                <div className="font-body font-medium text-ink reading-heading">{item.title}</div>
                {item.summary && (
                  <div className="text-sm text-inkmuted reading-muted mt-1">{item.summary}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}

      {digest.quickRecall?.length > 0 && (
        <section>
          <h2 className="digest-heading cat-recall font-display text-xl font-semibold mb-4">Quick Recall</h2>
          <ul className="grid gap-2">
            {digest.quickRecall.map((r, i) => (
              <li
                key={i}
                className="text-sm text-inkmuted reading-muted border-l-2 pl-3"
                style={{ borderColor: "currentColor" }}
              >
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
