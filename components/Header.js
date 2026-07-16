import Link from "next/link";
import ReadingModeToggle from "./ReadingModeToggle";

export default function Header() {
  return (
    <header className="border-b border-line reading-border bg-paper reading-surface">
      <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="font-display text-2xl font-semibold text-ink reading-heading tracking-tight">
          The Daily Brief
        </Link>
        <div className="flex items-center gap-6">
          <nav className="font-mono text-xs uppercase tracking-widest text-inkmuted reading-muted flex gap-6">
            <Link href="/" className="hover:text-brass">Today</Link>
            <Link href="/capsules" className="hover:text-brass">Capsules</Link>
            <Link href="/archive" className="hover:text-brass">Archive</Link>
          </nav>
          <ReadingModeToggle />
        </div>
      </div>
    </header>
  );
}
