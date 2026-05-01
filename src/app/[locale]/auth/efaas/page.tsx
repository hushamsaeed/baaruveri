import { Link } from "@/i18n/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { listStubUsers } from "@/db/queries/stub-users";
import { L } from "@/components/i18n-text";
import { chooseStubUser } from "../actions";

export const metadata = {
  title: "eFaas (stub) — Baaruveri",
  description:
    "Mock identity provider for the Baaruveri prototype. Real eFaas integration is post-v0.",
};

export const dynamic = "force-dynamic";

export default async function EfaasStubPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ return_to?: string; petition?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const returnTo = sp.return_to ?? "/";
  const stubUsers = await listStubUsers();
  return <EfaasBody returnTo={returnTo} stubUsers={stubUsers} />;
}

function EfaasBody({
  returnTo,
  stubUsers,
}: {
  returnTo: string;
  stubUsers: Awaited<ReturnType<typeof listStubUsers>>;
}) {
  const ta = useTranslations("auth");
  const tc = useTranslations("common");
  return (
    <main className="flex-1 bg-muted/40">
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-card border border-border p-7 sm:p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
            <L>{ta("efaas_subtitle")}</L>
          </div>
          <h1 className="text-xl font-semibold mb-2">
            <L>{ta("efaas_title")}</L>
          </h1>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-6">
            <L>{ta("efaas_helper")}</L>
          </p>

          <div className="bg-secondary/60 border border-border px-3 py-2 mb-5 text-[12px] text-secondary-foreground font-mono">
            <L>{ta("efaas_warning")}</L>
          </div>

          <ul className="grid gap-2.5">
            {stubUsers.map((u) => (
              <li key={u.id}>
                <form action={chooseStubUser}>
                  <input type="hidden" name="user_id" value={u.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button
                    type="submit"
                    className="block w-full text-start bg-card border border-border hover:border-primary/40 p-4 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="text-[15px] font-semibold">
                        <span className="dv-text me-2">{u.name_dv}</span>
                      </span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        <L>{ta("efaas_nid_label", { nid: u.nid })}</L>
                      </span>
                    </div>
                    <div className="text-[12px] text-muted-foreground font-mono">
                      <L>
                        {ta("efaas_user_meta", {
                          name_en: u.name_en,
                          island: u.island_slug,
                          date: u.verified_at,
                        })}
                      </L>
                    </div>
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-[12px]">
            <Link
              href={returnTo}
              className="text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              ← <L>{tc("cancel")}</L>
            </Link>
            <span className="text-muted-foreground font-mono text-[11px]">
              <L>{tc("v0_stub")}</L>
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed text-center mt-6 max-w-md mx-auto">
          <L>{ta("efaas_footer")}</L>
        </p>
      </div>
    </main>
  );
}
