import Link from "next/link";

type Variant = "gold" | "outline";

const base =
  "inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60";

const variants: Record<Variant, string> = {
  // Filled gold — primary action
  gold: "gradient-gold text-maroon-950 hover:brightness-110 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5",
  // Outlined — secondary action
  outline:
    "border border-gold/60 text-gold hover:bg-gold hover:text-maroon-950 hover:-translate-y-0.5",
};

export function Button({
  children,
  href,
  variant = "gold",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
}) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
