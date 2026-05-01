// Locale-aware relative-date formatter shared across thread / petition surfaces.
// Caller passes its useTranslations() result so the component owns the
// namespace; this avoids re-creating translation contexts inside lib code.

type Translator = (key: string, vals?: Record<string, number>) => string;

const NOW = new Date("2026-05-01");

export function relativeDate(iso: string, t: Translator): string {
  const target = new Date(iso);
  const days = Math.round((NOW.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return t("today");
  if (days === 1) return t("day_ago");
  if (days < 14) return t("days_ago", { n: days });
  if (days < 60) return t("weeks_ago", { n: Math.round(days / 7) });
  return target.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.max(0, Math.round((target - NOW.getTime()) / (1000 * 60 * 60 * 24)));
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
