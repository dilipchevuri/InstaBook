import Head from "next/head";
import Header from "../../components/Header";
import Stamp from "../../components/Stamp";
import CapsuleList from "../../components/CapsuleList";
import DateCalendar from "../../components/DateCalendar";
import { supabase } from "../../lib/supabaseClient";

export async function getServerSideProps() {
  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  const { data: allCapsules } = await supabase.from("capsules").select("slug");

  return {
    props: {
      capsule: capsule || null,
      availableDates: (allCapsules || []).map((c) => c.slug),
    },
  };
}

export default function CapsulesHome({ capsule, availableDates }) {
  return (
    <>
      <Head>
        <title>Static Capsule — The Daily Brief</title>
      </Head>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!capsule ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
              <div>
                <h1 className="font-display text-4xl text-ink reading-heading font-semibold leading-tight">
                  Static Capsule
                </h1>
                <p className="text-inkmuted reading-muted mt-1 text-sm">
                  One core-syllabus topic per subject — short, memorable, exam-ready.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DateCalendar type="capsule" availableDates={availableDates} activeDate={capsule.slug} />
                <Stamp dateStr={capsule.date} />
              </div>
            </div>
            <div className="mt-8">
              <CapsuleList digest={capsule.content_json} />
            </div>
            <a
              href="/capsules/archive"
              className="inline-block mt-10 font-mono text-xs uppercase tracking-widest text-inkmuted reading-muted hover:text-brass"
            >
              Browse past capsules →
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
        Run the daily automation once and today's static capsule will appear here.
      </p>
    </div>
  );
}
