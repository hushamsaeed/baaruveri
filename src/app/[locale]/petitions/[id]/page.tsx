import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getPetition } from "@/data/petitions";
import { getIslandById } from "@/data/islands";
import { getCurrentStubUser, type StubUser } from "@/lib/auth-stub";
import {
  getStubSignatureCount,
  hasSignedPetition,
} from "@/lib/signature-store";
import { signOutStubUser } from "@/app/[locale]/auth/actions";
import { PetitionSignBlock } from "@/components/petition-sign-block";
import { CivicDataSidebar } from "@/components/civic-data-sidebar";
import { L } from "@/components/i18n-text";
import { daysUntil, fmtDate } from "@/lib/date";
import type { Petition, Island } from "@/lib/types";

// Petition detail is dynamic — signature count + auth state aren't cacheable.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const p = getPetition(id);
  if (!p) return { title: "Not found — Baaruveri" };
  return {
    title: `${p.title_en} — Petitions — Baaruveri`,
    description: p.summary_en,
  };
}

export default async function PetitionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
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

  // Pre-resolve the scope label since useTranslations can't be called in async
  // server components and we need it in the client child below.
  const tp = await getTranslations({ locale, namespace: "petition" });
  const scopeLabel =
    petition.scope === "national"
      ? tp("scope_national")
      : tp("scope_island", { island: island?.name_en ?? "Island" });
  const islandLabel = island ? island.name_en : "Atlas";

  return (
    <PetitionBody
      petition={petition}
      island={island}
      user={user}
      totalSignatures={totalSignatures}
      alreadySigned={alreadySigned}
      days={days}
      scopeLabel={scopeLabel}
      islandLabel={islandLabel}
    />
  );
}

function PetitionBody({
  petition,
  island,
  user,
  totalSignatures,
  alreadySigned,
  days,
  scopeLabel,
  islandLabel,
}: {
  petition: Petition;
  island: Island | null | undefined;
  user: StubUser | null;
  totalSignatures: number;
  alreadySigned: boolean;
  days: number;
  scopeLabel: string;
  islandLabel: string;
}) {
  const tp = useTranslations("petition");
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-8 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <Link
            href={island ? `/atlas/${island.slug}` : "/atlas"}
            className="inline-flex items-center text-[12px] text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            ← {islandLabel}
          </Link>
          {user && (
            <form action={signOutStubUser} className="flex items-center gap-2 text-[11px] font-mono">
              <input
                type="hidden"
                name="return_to"
                value={`/petitions/${petition.id}`}
              />
              <span className="text-muted-foreground"><L>{tp("signed_in_as")}</L></span>
              <span className="dv-text">{user.name_dv}</span>
              <span className="text-muted-foreground">·</span>
              <button
                type="submit"
                className="text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                <L>{tp("sign_out")}</L>
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
                    ? "bg-foreground text-background px-2 py-[2px] me-2"
                    : "bg-secondary text-secondary-foreground px-2 py-[2px] me-2"
                }
              >
                <L>{petition.scope === "national" ? tp("national_tag") : tp("island_tag")}</L>
              </span>
              <L>{scopeLabel}</L>
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
                  <L>{tp("section_what_asks")}</L>
                </h2>
              </div>
              <p className="text-[15px] leading-relaxed">{petition.summary_en}</p>
            </section>

            <section className="mt-12">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">02</span>
                <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold">
                  <L>{tp("section_thresholds")}</L>
                </h2>
              </div>
              <ul className="space-y-3 text-[14px] leading-relaxed">
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">
                    <L>{tp("threshold_council")}</L>
                  </span>
                  <span>
                    {tp.rich("threshold_council_body", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">
                    <L>{tp("threshold_parliament")}</L>
                  </span>
                  <span>
                    {tp.rich("threshold_parliament_body", {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-muted-foreground w-32 shrink-0">
                    <L>{tp("threshold_verification")}</L>
                  </span>
                  <span><L>{tp("threshold_verification_body")}</L></span>
                </li>
              </ul>
            </section>

            <section className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground">
                <span>
                  <L>{tp("started_by_label")}</L>{" "}
                  <span className="dv-text mx-1">{petition.started_by_dv}</span>
                  <span className="font-mono">({petition.started_by_en})</span>
                </span>
                <span>·</span>
                <span className="font-mono">{fmtDate(petition.started_at)}</span>
                <span>·</span>
                <span className="font-mono">
                  <L>{tp("verified_short", { pct: petition.efaas_verified_pct })}</L>
                </span>
              </div>
            </section>
          </article>

          {island && <CivicDataSidebar island={island} />}
        </div>
      </div>
    </main>
  );
}
