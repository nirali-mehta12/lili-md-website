/*
  PLACEHOLDER logo — a simple gold cross/plus mark + wordmark, echoing
  the Canva design. Replace with the real LiLi M.D. logo SVG when it
  arrives: drop /public/logo.svg and swap the <svg> below for
  <Image src="/logo.svg" alt="LiLi M.D." width={..} height={..} />.
*/
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 text-gold"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 3v26M3 16h26M9 9l14 14M23 9L9 23"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-serif text-lg tracking-wide text-cream">
        LiLi M.D.
      </span>
    </span>
  );
}
