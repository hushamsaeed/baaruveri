import { useLocale } from "next-intl";

interface LProps {
  children: React.ReactNode;
}

/** Wraps translated content in <span class="dv-text"> when the active
 * locale is Dhivehi, so MV Faseyha + RTL apply. Inert in English.
 * Accepts ReactNode so it works with both plain t() strings and t.rich()
 * trees that include nested elements. */
export function L({ children }: LProps) {
  const locale = useLocale();
  if (locale === "dv") {
    return <span className="dv-text">{children}</span>;
  }
  return <>{children}</>;
}
