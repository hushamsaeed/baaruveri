import { Link } from "@/i18n/navigation";
import { STUB_USERS } from "@/lib/auth-stub";
import { chooseStubUser } from "../actions";

export const metadata = {
  title: "eFaas (stub) — Baaruveri",
  description:
    "Mock identity provider for the Baaruveri prototype. Real eFaas integration is post-v0.",
};

export default async function EfaasStubPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; petition?: string }>;
}) {
  const sp = await searchParams;
  const returnTo = sp.return_to ?? "/";

  return (
    <main className="flex-1 bg-muted/40">
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-card border border-border p-7 sm:p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
            eFaas · stub provider
          </div>
          <h1 className="text-xl font-semibold mb-2">
            <span className="dv-text mr-2">eFaas ޑިޖިޓަލް ޑީ</span>
            <span className="text-muted-foreground">— development stub</span>
          </h1>
          <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-6">
            In production, this is the redirect to the Maldives Government
            digital identity service. For the v0 prototype, choose a verified
            test citizen below to continue.
          </p>

          <div className="bg-secondary/60 border border-border px-3 py-2 mb-5 text-[12px] text-secondary-foreground font-mono">
            ⓘ This is not the real eFaas. No identity is verified.
          </div>

          <ul className="grid gap-2.5">
            {STUB_USERS.map((u) => (
              <li key={u.id}>
                <form action={chooseStubUser}>
                  <input type="hidden" name="user_id" value={u.id} />
                  <input type="hidden" name="return_to" value={returnTo} />
                  <button
                    type="submit"
                    className="block w-full text-left bg-card border border-border hover:border-primary/40 p-4 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="text-[15px] font-semibold">
                        <span className="dv-text mr-2">{u.name_dv}</span>
                      </span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        NID {u.nid}
                      </span>
                    </div>
                    <div className="text-[12px] text-muted-foreground font-mono">
                      {u.name_en} · registered on {u.island_slug} · verified{" "}
                      {u.verified_at}
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
              ← Cancel
            </Link>
            <span className="text-muted-foreground font-mono text-[11px]">
              v0 stub
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed text-center mt-6 max-w-md mx-auto">
          Stub identity sets a signed httpOnly cookie. No data is sent off this
          machine. Real eFaas integration follows Maldives Government OIDC and
          is gated by an MOU.
        </p>
      </div>
    </main>
  );
}
