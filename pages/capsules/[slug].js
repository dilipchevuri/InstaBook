import Head from "next/head";
import Header from "../../components/Header";
import Stamp from "../../components/Stamp";
import CapsuleList from "../../components/CapsuleList";
import DateCalendar from "../../components/DateCalendar";
import { supabase } from "../../lib/supabaseClient";

export async function getServerSideProps({ params }) {
  const { data: capsule } = await supabase
    .from("capsules")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!capsule) return { notFound: true };

  const { data: allCapsules } = await supabase.from("capsules").select("slug");

  return {
    props: {
      capsule,
      availableDates: (allCapsules || []).map((c) => c.slug),
    },
  };
}

export default function CapsuleDayPage({ capsule, availableDates }) {
  return (
    <>
      <Head><title>Static Capsule — {capsule.date}</title></Head>
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-display text-3xl text-ink reading-heading font-semibold leading-tight">
            Static Capsule
          </h1>
          <div className="flex items-center gap-3">
            <DateCalendar type="capsule" availableDates={availableDates} activeDate={capsule.slug} />
            <Stamp dateStr={capsule.date} />
          </div>
        </div>
        <CapsuleList digest={capsule.content_json} />
      </div>
    </>
  );
}
