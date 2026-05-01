"use client";

import { Link } from "@/i18n/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { fmtDate } from "@/lib/date";
import { signPetitionAction } from "@/app/[locale]/petitions/[id]/actions";
import type { StubUser } from "@/lib/auth-stub";

interface PetitionSignBlockProps {
  petitionId: string;
  baseSignatures: number;
  threshold: number;
  daysLeft: number;
  closesAt: string;
  user: StubUser | null;
  alreadySigned: boolean;
  returnTo: string;
}

export function PetitionSignBlock({
  petitionId,
  baseSignatures,
  threshold,
  daysLeft,
  closesAt,
  user,
  alreadySigned,
  returnTo,
}: PetitionSignBlockProps) {
  const tp = useTranslations("petition");
  const [signed, setSigned] = useState(alreadySigned);
  const [pending, startTransition] = useTransition();
  const [optimisticDelta, addOptimisticDelta] = useOptimistic(
    0,
    (curr: number, add: number) => curr + add
  );
  const [error, setError] = useState<string | null>(null);

  const displayCount =
    baseSignatures + (signed && !alreadySigned ? 1 : 0) + optimisticDelta;
  const pct = Math.min(100, (displayCount / threshold) * 100);
  const reached = displayCount >= threshold;

  function handleSign() {
    setError(null);
    startTransition(async () => {
      addOptimisticDelta(1);
      const res = await signPetitionAction(petitionId);
      if (res.ok) {
        setSigned(true);
      } else {
        setError(res.reason);
      }
    });
  }

  return (
    <div className="bg-card border border-border p-6 sm:p-7">
      <div className="grid sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-end">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center">
            <span className="live-dot" aria-hidden="true" />
            <L>{tp("live_signatures")}</L>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-semibold leading-none">
            <span className="num">{displayCount.toLocaleString("en-US")}</span>
            <span className="text-muted-foreground text-2xl ms-2">
              / {threshold.toLocaleString("en-US")}
            </span>
          </div>
          <div className="h-[6px] bg-muted mt-4 relative">
            <div
              className="h-full bg-primary transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="font-mono text-[11px] text-muted-foreground mt-2">
            {reached ? (
              <L>{tp("threshold_reached")}</L>
            ) : (
              <L>
                {tp("more_to_threshold", {
                  remaining: (threshold - displayCount).toLocaleString("en-US"),
                } as never)}
              </L>
            )}
          </div>
        </div>

        <div className="text-start sm:text-right">
          <div className="font-mono text-2xl sm:text-3xl font-semibold leading-none">
            <span className="num">{daysLeft}</span>
            <span className="text-muted-foreground text-xl ms-2">
              <L>{tp("days_left")}</L>
            </span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground mt-2">
            <L>{tp("closes_on", { date: fmtDate(closesAt) })}</L>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        {!user ? (
          <div className="grid gap-3">
            <Link
              href={`/auth/efaas?return_to=${encodeURIComponent(returnTo)}&petition=${petitionId}`}
              className="inline-flex items-center justify-center px-5 py-3 text-[14px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <L>{tp("sign_with_efaas")}</L>
            </Link>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              <L>{tp("sign_with_efaas_helper")}</L>
            </p>
          </div>
        ) : signed ? (
          <div className="grid gap-2">
            <div className="flex items-baseline gap-2 text-[14px] text-[color:var(--under)] font-semibold">
              <span aria-hidden="true">✓</span>
              <span><L>{tp("signed_thanks")}</L></span>
            </div>
            <p className="text-[11.5px] text-muted-foreground">
              <L>
                {tp("signed_recorded_under", {
                  name_dv: user.name_dv,
                  name_en: user.name_en,
                } as never)}
              </L>
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={handleSign}
              disabled={pending}
              className="inline-flex items-center justify-center px-5 py-3 text-[14px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors w-full sm:w-auto"
            >
              <L>{pending ? tp("signing") : tp("sign_this_petition")}</L>
            </button>
            <p className="text-[11.5px] text-muted-foreground">
              <L>
                {tp("signing_as", {
                  name_dv: user.name_dv,
                  name_en: user.name_en,
                } as never)}
              </L>
            </p>
            {error && (
              <p className="text-[12px] text-[color:var(--over)]">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
