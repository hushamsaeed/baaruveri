import { AtlasCard } from "@/components/atlas-card";
import { islands } from "@/data/islands";

export const metadata = {
  title: "Atlas — Baaruveri",
  description:
    "Per-island civic profiles: council, budget, housing, climate, procurement, threads, petitions.",
};

export default function AtlasPage() {
  const totalPop = islands.reduce((sum, i) => sum + i.population, 0);
  const totalThreads = islands.reduce((sum, i) => sum + i.active_threads, 0);
  const totalPetitions = islands.reduce((sum, i) => sum + i.active_petitions, 0);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            Atlas · 6 islands · v0 prototype
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="dv-text mr-3 font-bold">އެޓްލަސް</span>
            <span>Per-island civic profiles</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            Six representative islands across the Maldives: the capital and its
            reclaimed neighbour, two regional cities, one single-island atoll,
            and one small island whose MVR 600M+ airport made it the country's
            most-questioned public investment.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 font-mono text-sm">
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Total population covered
              </dt>
              <dd className="num text-lg mt-0.5">
                {totalPop.toLocaleString("en-US")}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Active threads
              </dt>
              <dd className="num text-lg mt-0.5">{totalThreads}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                Open petitions
              </dt>
              <dd className="num text-lg mt-0.5">{totalPetitions}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {islands.map((island) => (
            <AtlasCard key={island.id} island={island} />
          ))}
        </div>

        <p className="mt-12 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          Population figures from NBS census (2024). Voter registers from
          Elections Commission, dated 2026-04-04. Budget figures are
          illustrative for the prototype pending live council data feeds. Open
          data: every aggregate above is downloadable as CSV (coming next).
        </p>
      </section>
    </main>
  );
}
