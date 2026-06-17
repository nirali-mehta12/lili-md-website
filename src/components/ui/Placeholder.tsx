/*
  Placeholder for a designer asset that hasn't arrived yet.
  Renders a labeled, dashed box at the correct size/aspect ratio.

  When the real asset arrives:
    1. Drop the file in /public (e.g. /public/hero.jpg)
    2. Replace <Placeholder label="..." /> with
       <Image src="/hero.jpg" alt="..." fill /> (or width/height)
  The surrounding layout/sizing stays the same.
*/
export function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-gold/40 bg-maroon-800/40 text-center ${className}`}
    >
      <span className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold/70">
        {label}
        <span className="mt-1 block text-[10px] font-normal normal-case text-cream-muted/60">
          image placeholder
        </span>
      </span>
    </div>
  );
}
