import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { petitions, getPetition } from "@/data/petitions";
import { getIslandById } from "@/data/islands";
import { getCurrentStubUser } from "@/lib/auth-stub";
import {
  getStubSignatureCount,
  hasSignedPetition,
} from "@/lib/signature-store";
import { signOutStubUser } from "@/app/[locale]/auth/actions";
import { PetitionSignBlock } from "@/components/petition-sign-block";
import { CivicDataSidebar } from "@/components/civic-data-sidebar";

// Petition detail is dynamic — signature count + auth state aren't cacheable.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getPetition(id);
  if (!p) return { title: "Not found — Baaruveri" };
  return {
    title: `${p.title_en} — Petitions — Baaruveri`,
    description: p.summary_en,
  };
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = new Date("2026-05-01").getTime();
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60 * 24)));
}

export default async function PetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const petition = getPetition(id);
  if (!petition) notFound();

  const island = petition.island_id ? getIslandById(petition.island_id) : null;
  const user = await getCurrentStubUser();
  const sessionSigs = getStubSignatureCount(petition.id);
  const totalSignatures = petition.signatures + sessionSigs;
  const alreadySigned = user
    ? hasSignedPetition(petition.id, user.id)
    : false;
  const days = daysUntil(petition.closes_at);
  const scopeLabel =
    petition.scope === "national"
      ? "National · 5,000 signatures triggers Parliament agenda"
      : `Island · ${island?.name_en ?? "Island"} council response threshold`;

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <Link
            href={island ? `/atlas/${island.slug}` : "/atlas"}
            className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            ← {island ? island.name_en : "Atlas"}
          </Link>
          {user && (
            <form action={signOutStubUser} className="flex items-center gap-2 text-[11px] font-mono">
              <input
                type="hidden"
                name="return_to"
                value={`/petitions/${petition.id}`}
              />
              <span className="text-muted-foreground">Signed in as</span>
              <span className="dv-text">{user.name_dv}</span>
              <span className="text-muted-foreground">·</span>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                sign out
              </button>
            </form>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <article>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-4">
              <span
                className={
                  petition.scope === "national"
                    ? "bg-foreground text-background px-2 py-[2px] mr-2"
                    : "bg-secondary text-secondary-foreground px-2 py-[2px] mr-2"
                }
              >
                {petition.scope === "national" ? "National" : "Island"}
              </span>
              {scopeLabel}
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold leading-snug tracking-tight mb-4">
              <span className="dv-text">{petition.title_dv}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
              {petition.title_en}
            </p>

            <PetitionSignBlock
              petitionId={petition.id}
              baseSignatures={totalSignatures}
              threshold={petition.threshold}
              daysLeft={days}
              closesAt={petition.closes_at}
              user={user}
              alreadySigned={alreadySigned}
              returnTo={`/petitions/${petition.id}`}
            />

            <section className="mt-12">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">01</span>
                <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
                  What this petition asks
                </h2>
              </div>
              <p className="text-[15px] leading-relaxed">{petition.summary_en}</p>
            </section>

            <section className="mt-12">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">02</span>
                <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
                  How thresholds translate to action
                </h2>
              </div>
              <ul className="space-y-3 text-[14px] leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">Council response</span>
                  <span>
                    Per-island petitions reaching <strong>5% of registered voters</strong>{" "}
                    (floor 100, ceiling 500) require a written council response within 30 days.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">Parliament agenda</span>
                  <span>
                    Petitions reaching <strong>5,000 signatures nationally</strong> are placed on
                    the next available parliamentary agenda for debate.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">Verification</span>
                  <span>
                    Every signature passes through eFaas to prevent duplicates.
                    Verified-rate is published with the count so journalists can
                    judge signal quality.
                  </span>
                </li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
                <span>
                  Started by <span className="dv-text mx-1">{petition.started_by_dv}</span>
                  <span className="font-mono">({petition.started_by_en})</span>
                </span>
                <span>·</span>
                <span className="font-mono">
                  {new Date(petition.started_at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span className="font-mono">
                  {petition.efaas_verified_pct}% eFaas-verified
                </span>
              </div>
            </section>
          </article>

          {island && (
            <CivicDataSidebar island={island} />
          )}
        </div>
      </div>
    </main>
  );
}
