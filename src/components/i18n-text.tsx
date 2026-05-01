import { useLocale } from "next-intl";

interface LProps {
  children: string;
}

/** Wraps a translated string in <span class="dv-text"> when the active
 * locale is Dhivehi, so MV Faseyha + RTL apply. Inert in English. */
export function L({ children }: LProps) {
  const locale = useLocale();
  if (locale === "dv") {
    return <span className="dv-text">{children}</span>;
  }
  return <>{children}</>;
}
