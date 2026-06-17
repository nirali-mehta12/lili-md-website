/* Consistent section padding + max width across the page. */
export function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`px-6 py-20 sm:px-8 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

/* Centered section heading with the small gold rule beneath it. */
export function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-serif text-3xl tracking-tight text-cream sm:text-4xl md:text-5xl">
        {children}
      </h2>
      <div className="rule-gold mx-auto mt-6 w-24" />
    </div>
  );
}
