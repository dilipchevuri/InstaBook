import Head from "next/head";
import Link from "next/link";
import Header from "../../../components/Header";
import { supabase } from "../../../lib/supabaseClient";
import { categoryClass } from "../../../lib/categories";

export async function getServerSideProps({ params }) {
  const { data: note } = await supabase
    .from("notes")
    .select("slug, date, title, content_json")
    .eq("slug", params.slug)
    .single();

  if (!note) return { notFound: true };

  let item = null;
  let category = null;
  for (const section of note.content_json?.sections || []) {
    const found = section.items.find((i) => i.id === params.item);
    if (found) {
      item = found;
      category = section.category;
      break;
    }
  }

  if (!item) return { notFound: true };

  return { props: { note: { slug: note.slug, date: note.date, title: note.title }, item, category } };
}

export default function ItemPage({ note, item, category }) {
  const cls = categoryClass(category);

  return (
    <>
      <Head><title>{item.title}</title></Head>
      <Header />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          href={`/notes/${note.slug}`}
          className="font-mono text-xs uppercase tracking-widest text-inkmuted reading-muted hover:text-brass"
        >
          ← Back to {new Date(note.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </Link>

        <div className={`digest-heading ${cls} font-mono text-xs uppercase tracking-widest mt-6 mb-2`}>
          {category}
        </div>
        <h1 className="font-display text-3xl text-ink reading-heading font-semibold leading-tight mb-6">
          {item.title}
        </h1>

        <ul className="grid gap-3 mb-6">
          {(item.points || []).map((p, i) => (
            <li
              key={i}
              className={`digest-point ${cls} text-inkmuted reading-muted pl-5 relative text-[1.05rem] leading-relaxed`}
            >
              {p}
            </li>
          ))}
        </ul>

        {(item.prelimsPointer || item.mainsAngle) && (
          <div className="grid gap-3 mb-6">
            {item.prelimsPointer && (
              <div className="pointer-prelims rounded-sm p-4">
                <div className="capsule-pill" style={{ backgroundColor: "#1E7A8C" }}>Prelims</div>
                <p className="text-inkmuted reading-muted mt-2 text-[0.95rem] leading-relaxed">
                  {item.prelimsPointer}
                </p>
              </div>
            )}
            {item.mainsAngle && (
              <div className="pointer-mains rounded-sm p-4">
                <div className="capsule-pill" style={{ backgroundColor: "#9A3324" }}>Mains</div>
                <p className="text-inkmuted reading-muted mt-2 text-[0.95rem] leading-relaxed">
                  {item.mainsAngle}
                </p>
              </div>
            )}
          </div>
        )}

        <Link
          href={`/quiz/${note.slug}`}
          className="inline-block mt-4 font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-brass to-coral text-paper px-6 py-3 rounded-sm hover:opacity-90 shadow-sm"
        >
          Take today's quiz →
        </Link>
      </div>
    </>
  );
}
