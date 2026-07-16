import Head from "next/head";
import Header from "../../components/Header";
import CapsuleCard from "../../components/CapsuleCard";
import { supabase } from "../../lib/supabaseClient";

export async function getServerSideProps() {
  const { data: capsules } = await supabase
    .from("capsules")
    .select("slug, date")
    .order("date", { ascending: false });

  return { props: { capsules: capsules || [] } };
}

export default function CapsuleArchive({ capsules }) {
  return (
    <>
      <Head><title>Capsule Archive — The Daily Brief</title></Head>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-ink reading-heading font-semibold mb-8">Capsule Archive</h1>
        <div className="grid gap-4">
          {capsules.map((c) => <CapsuleCard key={c.slug} capsule={c} />)}
          {capsules.length === 0 && (
            <p className="text-inkmuted reading-muted">No capsules filed yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
