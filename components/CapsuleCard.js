import Link from "next/link";

export default function CapsuleCard({ capsule }) {
  return (
    <Link
      href={`/capsules/${capsule.slug}`}
      className="block border border-line reading-border rounded-sm p-5 hover:border-brass transition-colors"
    >
      <div className="font-mono text-xs text-inkmuted reading-muted uppercase tracking-widest mb-2">
        {new Date(capsule.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
      </div>
      <div className="font-display text-xl text-ink reading-heading font-semibold">Static Capsule</div>
    </Link>
  );
}
