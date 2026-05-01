import { setRequestLocale, getTranslations } from "next-intl/server";
import { L } from "@/components/i18n-text";
import { Link } from "@/i18n/navigation";
import { listTakedowns } from "@/db/queries/takedowns";

export const metadata = {
  title: "Takedowns log — Baaruveri",
  description:
    "Public moderation record. Every removal documented end-to-end per the moderation policy.",
};

// Takedowns are rare events; 60s revalidate keeps the public log fresh
// without re-running the query on every visitor.
export const revalidate = 60;

const REASON_LABEL: Record<string, string> = {
  threat: "Threat of violence",
  doxx: "Doxxing",
  csam: "CSAM",
  coordinated_inauthentic: "Coordinated inauthentic behaviour",
  signature_fraud: "Petition signature fraud",
};

const KIND_LABEL: Record<string, string> = {
  comment: "comment",
  claim: "claim",
  thread: "thread",
};

export default async function TakedownsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, takedowns] = await Promise.all([
    getTranslations("takedowns"),
    listTakedowns(),
  ]);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            <L>{t("page_subtitle")}</L>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <L>{t("page_title")}</L>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            <L>
              {t.rich("page_lede", {
                policy: (chunks) => (
                  <Link
                    href="/about/moderation"
                    className="text-primary underline underline-offset-2"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </L>
          </p>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
        {takedowns.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center">
            <p className="text-[14px] text-muted-foreground leading-relaxed max-w-md mx-auto">
              <L>{t("empty")}</L>
            </p>
            <p className="mt-6 pt-6 border-t border-border text-[11px] text-muted-foreground">
              <Link
                href="/about/moderation"
                className="text-primary underline underline-offset-2"
              >
                Read the moderation policy →
              </Link>
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {(["col_when", "col_kind", "col_reason", "col_rationale", "col_author", "col_appeal"] as const).map((k) => (
                  <th
                    key={k}
                    className="text-start pb-2 px-3 border-b-[1.5px] border-foreground text-[10.5px] uppercase tracking-[0.08em] font-semibold text-muted-foreground"
                  >
                    <L>{t(k)}</L>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {takedowns.map((td) => (
                <tr key={td.id} className="border-b border-border">
                  <td className="py-3 px-3 font-mono text-[11.5px]">
                    {td.created_at.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11.5px]">
                    {KIND_LABEL[td.target_kind] ?? td.target_kind}
                  </td>
                  <td className="py-3 px-3">
                    {REASON_LABEL[td.reason_category] ?? td.reason_category}
                  </td>
                  <td className="py-3 px-3 max-w-md">{td.moderator_rationale}</td>
                  <td className="py-3 px-3 font-mono text-[11.5px]">
                    {td.original_author_display}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11.5px] text-muted-foreground">
                    {td.appeal_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-12 pt-6 border-t border-border text-[11px] text-muted-foreground leading-relaxed max-w-2xl">
          <L>{t("footnote")}</L>
        </p>
      </section>
    </main>
  );
}
