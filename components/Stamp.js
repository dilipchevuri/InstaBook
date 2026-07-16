export default function Stamp({ dateStr }) {
  const pretty = new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div
      className="inline-flex flex-col items-center border-2 border-stamp text-stamp rounded-sm px-4 py-2 -rotate-3 select-none"
      style={{ borderStyle: "double" }}
      aria-hidden="true"
    >
      <span className="font-mono text-[10px] tracking-[0.2em]">ISSUED</span>
      <span className="font-mono text-sm font-medium">{pretty}</span>
    </div>
  );
}
