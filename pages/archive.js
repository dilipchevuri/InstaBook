import Head from "next/head";
import Header from "../components/Header";
import NoteCard from "../components/NoteCard";
import { supabase } from "../lib/supabaseClient";

export async function getServerSideProps() {
  const { data: notes } = await supabase
    .from("notes")
    .select("slug, date, title")
    .order("date", { ascending: false });

  return { props: { notes: notes || [] } };
}

export default function Archive({ notes }) {
  return (
    <>
      <Head><title>Archive — The Daily Brief</title></Head>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-ink reading-heading font-semibold mb-8">Archive</h1>
        <div className="grid gap-4">
          {notes.map((n) => <NoteCard key={n.slug} note={n} />)}
          {notes.length === 0 && (
            <p className="text-inkmuted reading-muted">No digests filed yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
