"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Saafu-restrained search affordance. Magnifying-glass icon collapses by
// default; click or Cmd-K expands an inline input. Typing fires a
// debounced fetch against /api/v1/search; results land in a paper card
// with hairline borders, grouped by kind. Esc collapses the whole thing.

interface IslandHit {
  kind: "island";
  id: string;
  slug: string;
  name_en: string;
  name_dv: string;
  atoll_en: string;
}
interface ThreadHit {
  kind: "thread";
  id: string;
  title_en: string;
  title_dv: string;
  issue: string;
}
interface PetitionHit {
  kind: "petition";
  id: string;
  title_en: string;
  title_dv: string;
  scope: "island" | "national";
}

interface ApiPayload {
  data: {
    islands: IslandHit[];
    threads: ThreadHit[];
    petitions: PetitionHit[];
  };
}

const DEBOUNCE_MS = 180;

export function SearchAffordance() {
  const t = useTranslations("search");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiPayload["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputId = useId();

  // Cmd-K / Ctrl-K shortcut + Esc to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        // Defer focus so the input has mounted.
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setQuery("");
        setResults(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Click-outside to close.
  useEffect(() => {
    if (!isOpen) return;
    function onPointer(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, [isOpen]);

  // Debounced fetch. State resets for too-short queries happen in the
  // input's onChange so we don't trigger setState inside this effect.
  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      startTransition(async () => {
        try {
          const r = await fetch(
            `/api/v1/search?q=${encodeURIComponent(query)}`,
            { signal: controller.signal }
          );
          if (!r.ok) {
            setError(t("error"));
            return;
          }
          const payload = (await r.json()) as ApiPayload;
          setResults(payload.data);
          setError(null);
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          setError(t("error"));
        }
      });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [query, isOpen, t]);

  const navigate = useCallback(
    (path: string) => {
      setIsOpen(false);
      setQuery("");
      setResults(null);
      router.push(path);
    },
    [router]
  );

  const totalHits =
    (results?.islands.length ?? 0) +
    (results?.threads.length ?? 0) +
    (results?.petitions.length ?? 0);

  return (
    <div ref={containerRef} className="relative h-full flex items-center">
      {!isOpen ? (
        <button
          type="button"
          aria-label={t("open")}
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
        >
          <SearchIcon />
        </button>
      ) : (
        <div className="flex items-center h-9 border border-border bg-background">
          <span className="ps-2 text-muted-foreground">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              if (next.trim().length < 2) {
                setResults(null);
                setError(null);
              }
            }}
            placeholder={t("placeholder")}
            className="bg-transparent border-0 outline-none px-2 text-[13px] w-44 sm:w-64 focus:ring-0"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex me-2 font-mono text-[10px] text-muted-foreground border border-border px-1 py-[1px]">
            esc
          </kbd>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute end-0 top-full mt-1.5 w-[min(420px,calc(100vw-2rem))] bg-card border border-border shadow-sm z-40">
          {error ? (
            <div className="px-4 py-3 text-[12px] text-[color:var(--over)]">
              {error}
            </div>
          ) : isPending && !results ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground italic">
              {t("loading")}
            </div>
          ) : results && totalHits === 0 ? (
            <div className="px-4 py-3 text-[12px] text-muted-foreground italic">
              {t("no_results", { q: query })}
            </div>
          ) : results ? (
            <ul className="py-1 max-h-[60vh] overflow-y-auto">
              {results.islands.length > 0 && (
                <ResultGroup label={t("group_islands")}>
                  {results.islands.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/atlas/${h.slug}`)}
                        className="w-full text-start px-4 py-2 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-baseline gap-2 text-[13px]">
                          <span className="dv-text">{h.name_dv}</span>
                          <span className="text-foreground">{h.name_en}</span>
                        </div>
                        <div className="text-[10.5px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-[1px]">
                          {h.atoll_en} Atoll
                        </div>
                      </button>
                    </li>
                  ))}
                </ResultGroup>
              )}
              {results.threads.length > 0 && (
                <ResultGroup label={t("group_threads")}>
                  {results.threads.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/sandbar/${h.id}`)}
                        className="w-full text-start px-4 py-2 hover:bg-muted/60 transition-colors"
                      >
                        <div className="text-[13px] text-foreground line-clamp-2 leading-snug">
                          {h.title_en}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-[1px]">
                          {h.issue}
                        </div>
                      </button>
                    </li>
                  ))}
                </ResultGroup>
              )}
              {results.petitions.length > 0 && (
                <ResultGroup label={t("group_petitions")}>
                  {results.petitions.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/petitions/${h.id}`)}
                        className="w-full text-start px-4 py-2 hover:bg-muted/60 transition-colors"
                      >
                        <div className="text-[13px] text-foreground line-clamp-2 leading-snug">
                          {h.title_en}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground font-mono uppercase tracking-[0.1em] mt-[1px]">
                          {h.scope}
                        </div>
                      </button>
                    </li>
                  ))}
                </ResultGroup>
              )}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <div className="px-4 pt-2 pb-1 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <ul className="border-b border-border last:border-b-0">{children}</ul>
    </li>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
