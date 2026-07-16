import Head from "next/head";
import Header from "../components/Header";
import Stamp from "../components/Stamp";
import DigestList from "../components/DigestList";
import DateCalendar from "../components/DateCalendar";
import { supabase } from "../lib/supabaseClient";

export async function getServerSideProps() {
  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const { data: allNotes } = await supabase.from("notes").select("slug");

  return {
    props: {
      note: note || null,
      availableDates: (allNotes || []).map((n) => n.slug),
    },
  };
}

export default function Home({ note, availableDates }) {
  return (
    <>
      <Head>
        <title>The Daily Brief — GS Digest for Civil Services Aspirants</title>
      </Head>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        {!note ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <h1 className="font-display text-4xl text-ink reading-heading font-semibold leading-tight max-w-md">
                {note.title}
              </h1>
              <div className="flex items-center gap-3">
                <DateCalendar type="note" availableDates={availableDates} activeDate={note.slug} />
                <Stamp dateStr={note.date} />
              </div>
            </div>
            <DigestList dateSlug={note.slug} digest={note.content_json} />
            <a
              href={`/quiz/${note.slug}`}
              className="inline-block mt-10 font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-brass to-coral text-paper px-6 py-3 rounded-sm hover:opacity-90 shadow-sm"
            >
              Take today's quiz →
            </a>
          </>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="border border-line reading-border rounded-sm p-8 text-center">
      <p className="font-display text-2xl text-ink reading-heading mb-2">Nothing filed yet.</p>
      <p className="font-body text-inkmuted reading-muted">
        Run the daily automation once (see SETUP_GUIDE.md) and today's digest will appear here.
      </p>
    </div>
  );
}
