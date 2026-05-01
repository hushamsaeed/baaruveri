"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { submitClaimAction } from "@/app/[locale]/sandbar/[threadId]/claim-actions";

export type ClaimAuthorAttribution =
  | { kind: "anon"; pseudonym: string }
  | { kind: "verified"; nameDv: string; nameEn: string };

interface ClaimAddAffordanceProps {
  threadId: string;
  parentClaimId: string | null;
  attribution: ClaimAuthorAttribution;
}

// Renders the two ghost-style "+ supporting" / "+ rebut" buttons that
// open an inline add form for a chosen side. Both side options are
// available on every claim — Kialo lets you add either a supporting or
// a rebutting child to any claim.
export function ClaimAddAffordance({
  threadId,
  parentClaimId,
  attribution,
}: ClaimAddAffordanceProps) {
  const t = useTranslations("thread_detail");
  const [openSide, setOpenSide] = useState<"pro" | "con" | null>(null);

  if (openSide) {
    return (
      <ClaimAddForm
        threadId={threadId}
        parentClaimId={parentClaimId}
        side={openSide}
        attribution={attribution}
        onCancel={() => setOpenSide(null)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-[11px]">
      <button
        type="button"
        onClick={() => setOpenSide("pro")}
        className="font-mono uppercase tracking-[0.1em] text-[color:var(--under)]/80 hover:text-[color:var(--under)] hover:underline underline-offset-2"
      >
        <L>{t("add_supporting")}</L>
      </button>
      <button
        type="button"
        onClick={() => setOpenSide("con")}
        className="font-mono uppercase tracking-[0.1em] text-[color:var(--over)]/80 hover:text-[color:var(--over)] hover:underline underline-offset-2"
      >
        <L>{t("add_rebut")}</L>
      </button>
    </div>
  );
}

interface ClaimAddFormProps {
  threadId: string;
  parentClaimId: string | null;
  side: "pro" | "con"; // pro = "supporting"; con = "rebut"
  attribution: ClaimAuthorAttribution;
  onCancel: () => void;
}

// Root-level entry-point button. Exposes the same ClaimAddForm but with
// a one-button toggle scoped to the column's side (pro or con). Used at
// the top/bottom of each ClaimTree column so the "where do I post" gap
// from v3.0 is closed.
export function RootClaimAddAffordance({
  threadId,
  side,
  attribution,
}: {
  threadId: string;
  side: "pro" | "con";
  attribution: ClaimAuthorAttribution;
}) {
  const t = useTranslations("thread_detail");
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <ClaimAddForm
        threadId={threadId}
        parentClaimId={null}
        side={side}
        attribution={attribution}
        onCancel={() => setOpen(false)}
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={
        "font-mono uppercase tracking-[0.1em] text-[11px] hover:underline underline-offset-2 self-start py-2 " +
        (side === "pro"
          ? "text-[color:var(--under)]/80 hover:text-[color:var(--under)]"
          : "text-[color:var(--over)]/80 hover:text-[color:var(--over)]")
      }
    >
      <L>{t(side === "pro" ? "add_pro_position" : "add_con_position")}</L>
    </button>
  );
}

function ClaimAddForm({
  threadId,
  parentClaimId,
  side,
  attribution,
  onCancel,
}: ClaimAddFormProps) {
  const t = useTranslations("thread_detail");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyDv, setBodyDv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitClaimAction(
        threadId,
        side,
        bodyEn,
        bodyDv || null,
        parentClaimId
      );
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      // Form done — collapse + force a refresh so the new claim appears.
      setBodyEn("");
      setBodyDv("");
      onCancel();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 pt-3 border-t border-border space-y-3"
    >
      <p className="text-[11px] text-muted-foreground font-mono">
        {attribution.kind === "anon" ? (
          <L>{t("add_form_attribution_anon", { pseudonym: attribution.pseudonym })}</L>
        ) : (
          <L>
            {t("add_form_attribution_verified", {
              name_dv: attribution.nameDv,
              name_en: attribution.nameEn,
            })}
          </L>
        )}
      </p>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1">
          <L>{t("add_form_body_en_label")}</L>
        </label>
        <textarea
          value={bodyEn}
          onChange={(e) => setBodyEn(e.target.value)}
          placeholder={t("add_form_body_en_placeholder")}
          rows={3}
          maxLength={2000}
          required
          className="w-full bg-background border border-border px-3 py-2 text-[13.5px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[color:var(--ring)]"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-[0.1em] text-muted-foreground mb-1">
          <L>{t("add_form_body_dv_label")}</L>
        </label>
        <textarea
          value={bodyDv}
          onChange={(e) => setBodyDv(e.target.value)}
          placeholder={t("add_form_body_dv_placeholder")}
          rows={2}
          maxLength={2000}
          dir="rtl"
          className="dv-text w-full bg-background border border-border px-3 py-2 text-[13.5px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[color:var(--ring)]"
        />
      </div>

      {error && (
        <p className="text-[12px] text-[color:var(--over)]">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !bodyEn.trim()}
          className="bg-primary text-primary-foreground px-3 py-1.5 text-[12px] font-mono uppercase tracking-[0.1em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          <L>{isPending ? t("add_form_submitting") : t("add_form_submit")}</L>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-[12px] text-muted-foreground hover:text-foreground font-mono uppercase tracking-[0.1em]"
        >
          <L>{t("add_form_cancel")}</L>
        </button>
      </div>
    </form>
  );
}
