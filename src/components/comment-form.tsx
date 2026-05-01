"use client";

import { Link } from "@/i18n/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { L } from "./i18n-text";
import { submitCommentAction } from "@/app/[locale]/sandbar/[threadId]/comment-actions";
import type { StubUser } from "@/lib/auth-stub";
import type { IssueTag } from "@/lib/types";

interface CommentFormProps {
  threadId: string;
  threadIssue: IssueTag;
  user: StubUser | null;
  /** Pre-computed pseudonym preview for unauthed users (optional — only set
   *  when the user is anon AND posting is allowed for this issue tag). */
  anonPseudonymPreview: string | null;
  /** True when the issue tag requires eFaas verification. */
  verificationRequired: boolean;
  returnTo: string;
}

export function CommentForm({
  threadId,
  threadIssue,
  user,
  anonPseudonymPreview,
  verificationRequired,
  returnTo,
}: CommentFormProps) {
  const tc = useTranslations("comment");
  const ti = useTranslations("issue");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (verificationRequired && !user) {
    return (
      <div className="bg-muted/40 border border-border p-5">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground mb-2">
          <L>{tc("verification_required_title")}</L>
        </div>
        <p className="text-[13.5px] leading-relaxed mb-4">
          <L>
            {tc("verification_required_body", { issue: ti(threadIssue) })}
          </L>
        </p>
        <Link
          href={{
            pathname: "/auth/efaas",
            query: { return_to: returnTo },
          }}
          className="inline-flex items-center px-4 py-2 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <L>{tc("sign_in_with_efaas")}</L>
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await submitCommentAction(threadId, body);
      if (res.ok) {
        setBody("");
      } else {
        setError(res.reason);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border p-5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={tc("form_placeholder")}
        rows={4}
        maxLength={4000}
        disabled={pending}
        className="w-full bg-transparent border border-border p-3 text-[14px] leading-relaxed font-sans focus:outline-none focus:border-primary resize-y"
      />
      <div className="mt-3 flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-[11.5px] text-muted-foreground leading-relaxed flex-1 min-w-[200px]">
          {user ? (
            <L>
              {tc("posting_as_verified", {
                name_dv: user.name_dv,
                name_en: user.name_en,
              })}
            </L>
          ) : anonPseudonymPreview ? (
            <L>
              {tc("posting_as_anon", { pseudonym: anonPseudonymPreview })}
            </L>
          ) : null}
        </p>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="inline-flex items-center px-4 py-2 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <L>{pending ? tc("form_submitting") : tc("form_submit")}</L>
        </button>
      </div>
      {error && (
        <p className="mt-3 text-[12px] text-[color:var(--over)]">{error}</p>
      )}
    </form>
  );
}
