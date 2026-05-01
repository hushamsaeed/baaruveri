"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchAffordance } from "./search-affordance";
import { signOutStubUser } from "@/app/[locale]/auth/actions";
import type { StubUser } from "@/lib/auth-stub";

const NAV_ITEMS = [
  { href: "/atlas", key: "atlas" },
  { href: "/sandbar", key: "sandbar" },
  { href: "/petitions", key: "petitions" },
  { href: "/datasets", key: "datasets" },
] as const;

interface TopNavProps {
  user: StubUser | null;
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tp = useTranslations("petition");

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="sticky top-0 z-30 bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-10 h-14 flex items-center gap-3 sm:gap-6">
        <Link
          href="/"
          className="font-mono text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.16em] text-foreground hover:text-primary transition-colors flex items-baseline gap-1.5 sm:gap-2 shrink-0"
        >
          <span className="hidden xs:inline">BAARUVERI</span>
          <span className="xs:hidden">BAARU.</span>
          <span className="dv-text text-[13px] sm:text-[14px] font-semibold normal-case tracking-normal">
            ބާރުވެރި
          </span>
        </Link>

        <div className="flex-1 flex items-center justify-end h-full">
          <ul className="hidden md:flex items-center h-full">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="h-full">
                  <Link
                    href={item.href}
                    className={`inline-flex items-center h-full px-3.5 -mb-px border-b-2 text-[13px] font-medium transition-colors ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-foreground/70 hover:text-primary"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3.5 h-full md:ms-2 md:ps-3.5 md:border-s md:border-border">
            <SearchAffordance />
            <LocaleSwitcher compact />
            {user ? (
              <form action={signOutStubUser} className="flex items-baseline gap-1.5 font-mono text-[11px]">
                <input type="hidden" name="return_to" value={pathname} />
                <span className="text-foreground hidden sm:inline">
                  <span className="dv-text text-[12.5px]">{user.name_dv}</span>
                </span>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <button
                  type="submit"
                  className="text-primary hover:underline underline-offset-2"
                >
                  {tp("sign_out")}
                </button>
              </form>
            ) : (
              <Link
                href={{
                  pathname: "/auth/efaas",
                  query: { return_to: pathname },
                }}
                className="font-mono text-[11px] bg-foreground text-background px-2.5 py-1 hover:bg-primary transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">{tp("sign_with_efaas")}</span>
                <span className="sm:hidden">eFaas →</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only secondary nav row */}
      <div className="md:hidden border-t border-border bg-background overflow-x-auto">
        <ul className="flex items-stretch h-11 px-2 min-w-full">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1 min-w-fit">
                <Link
                  href={item.href}
                  className={`inline-flex items-center justify-center w-full h-full px-3 -mb-px border-b-2 text-[12px] font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-foreground/70 hover:text-primary"
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
