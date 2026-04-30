import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono mb-4">
          ބާރުވެރި · Baaruveri
        </p>
        <h1 className="max-w-3xl text-3xl sm:text-4xl font-semibold tracking-tight mb-5">
          Per-island civic data, made browsable.
        </h1>
        <p className="max-w-xl text-base text-muted-foreground leading-relaxed mb-10">
          Atlas of council, budget, housing, climate and procurement for every
          inhabited island. Sandbar for issue × island debate. Threshold-triggered
          petitions, signed with eFaas.
        </p>
        <div className="flex gap-3 mb-16">
          <Link
            href="/atlas"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open the atlas →
          </Link>
          <Link
            href="/sandbar"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors"
          >
            Sandbar
          </Link>
        </div>
      </section>
      <footer className="border-t border-border px-6 py-6 text-center text-[11px] text-muted-foreground">
        Concept prototype. Not an official Government of Maldives product.
      </footer>
    </main>
  );
}
