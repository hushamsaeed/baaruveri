"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SearchAffordance } from "./search-affordance";
import { signOutStubUser } from "@/app/[locale]/auth/actions";
import type { StubUser } from "@/lib/auth-stub";

// Vignelli civic-press masthead — replaces the v3 nav-bar treatment.
// Three columns per spec §7.1: brand-block | publication strap |
// meta column. 8px solid ink top border, 2px solid ink bottom. The
// nav links are no longer a horizontal strip — they collapse into
// the lane rail below the masthead (rendered by the homepage hero
// or by individual surface pages).
//
// The user-actions cluster (search, locale, eFaas sign-in/out)
// stays in the masthead's meta column on desktop and a thin
// secondary row on mobile, since those affordances are needed on
// every surface and not just the home feed.

interface TopNavProps {
  user: StubUser | null;
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tMast = useTranslations("masthead");
  const tp = useTranslations("petition");

  return (
    <header
      className="bg-paper border-b-[2px] border-t-[8px]"
      style={{ borderTopColor: "var(--ink)", borderBottomColor: "var(--ink)" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 sm:py-5 grid items-end gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-[auto_1fr_auto]">
        {/* Brand-block — Archivo Black 28-38px stacked, MV Faseyha
            beside (or below in compact). Linkable to home. */}
        <Link
          href="/"
          className="inline-flex items-baseline gap-3 group"
          aria-label={tMast("brand_aria")}
        >
          <span className="font-display text-[26px] sm:text-[34px] leading-[0.85] tracking-[-0.025em] uppercase text-ink">
            {tMast("brand_line_1")}
            <br />
            {tMast("brand_line_2")}
          </span>
          <span
            className="dv-text font-bold text-[22px] sm:text-[28px] leading-none"
            style={{ fontFamily: "var(--font-dv)" }}
          >
            {tMast("brand_dv")}
          </span>
        </Link>

        {/* Pub strap — middle column on desktop, hidden on mobile */}
        <div className="hidden sm:block">
          <div
            className="font-bold text-[10.5px] uppercase tracking-[0.16em]"
            style={{
              fontFamily: "var(--font-sans-bold)",
              color: "var(--ink-soft)",
            }}
          >
            {tMast("vol_strap")}
          </div>
          <div
            className="font-bold text-[15px] sm:text-[16px] uppercase tracking-[0.04em] leading-[1.2] mt-1 max-w-md"
            style={{ fontFamily: "var(--font-sans-bold)" }}
          >
            {tMast("publication_strap")}
          </div>
        </div>

        {/* Meta column — affordances + small civic counters */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
          <SearchAffordance />
          <LocaleSwitcher compact />
          {user ? (
            <form action={signOutStubUser} className="flex items-baseline gap-1.5 font-mono text-[11px]">
              <input type="hidden" name="return_to" value={pathname} />
              <span className="hidden sm:inline">
                <span className="dv-text text-[12.5px]">{user.name_dv}</span>
              </span>
              <button
                type="submit"
                className="text-vignelli-red hover:underline underline-offset-2 uppercase tracking-[0.08em]"
                style={{ color: "var(--vignelli-red)" }}
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
              className="font-mono text-[11px] px-2.5 py-1 text-paper hover:opacity-90 transition-opacity whitespace-nowrap uppercase tracking-[0.08em]"
              style={{
                background: "var(--vignelli-red)",
                color: "var(--paper)",
              }}
            >
              <span className="hidden sm:inline">{tp("sign_with_efaas")}</span>
              <span className="sm:hidden">eFaas →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Section nav row — primary surfaces. On desktop it's a thin
          rule-separated row; on mobile it scrolls horizontally. */}
      <nav
        className="border-t overflow-x-auto"
        style={{ borderTopColor: "var(--paper-rule)" }}
        aria-label={tNav("primary_nav_aria")}
      >
        <ul className="max-w-6xl mx-auto px-4 sm:px-10 flex items-stretch h-10 min-w-full">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="flex">
                <Link
                  href={item.href}
                  className="inline-flex items-center px-3 sm:px-4 -mb-px text-[11px] sm:text-[12px] uppercase tracking-[0.12em] font-bold whitespace-nowrap transition-colors"
                  style={{
                    fontFamily: "var(--font-sans-bold)",
                    color: active ? "var(--paper)" : "var(--ink)",
                    background: active ? "var(--ink)" : "transparent",
                  }}
                >
                  {tNav(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

const NAV_ITEMS = [
  { href: "/atlas", key: "atlas" },
  { href: "/sandbar", key: "sandbar" },
  { href: "/petitions", key: "petitions" },
  { href: "/datasets", key: "datasets" },
] as const;
