import Head from "next/head";
import Header from "../../components/Header";
import QuizWidget from "../../components/QuizWidget";
import { supabase } from "../../lib/supabaseClient";

export async function getServerSideProps({ params }) {
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!quiz) return { notFound: true };
  return { props: { quiz } };
}

export default function QuizPage({ quiz }) {
  return (
    <>
      <Head><title>Quiz — {quiz.date}</title></Head>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl text-ink reading-heading font-semibold mb-8">
          Quiz — {new Date(quiz.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </h1>
        <QuizWidget slug={quiz.slug} questions={quiz.questions} />
      </div>
    </>
  );
}
