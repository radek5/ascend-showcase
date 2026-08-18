"use client";

export default function PrintBadgeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-black px-8 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
    >
      Print Badge
    </button>
  );
}
