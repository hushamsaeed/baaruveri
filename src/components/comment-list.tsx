import { getTranslations } from "next-intl/server";
import { L } from "./i18n-text";
import type { Comment } from "@/db/queries/comments";

interface CommentListProps {
  comments: Comment[];
}

export async function CommentList({ comments }: CommentListProps) {
  const tc = await getTranslations("comment");
  if (comments.length === 0) {
    return (
      <p className="text-[13.5px] text-muted-foreground italic">
        <L>{tc("empty")}</L>
      </p>
    );
  }

  // Build a map of parent → children, then render top-level + nested.
  const byParent = new Map<string | null, Comment[]>();
  for (const c of comments) {
    const k = c.parent_comment_id ?? null;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(c);
  }

  return (
    <ul className="space-y-4">
      {(byParent.get(null) ?? []).map((c) => (
        <CommentNode key={c.id} comment={c} byParent={byParent} depth={0} />
      ))}
    </ul>
  );
}

function CommentNode({
  comment: c,
  byParent,
  depth,
}: {
  comment: Comment;
  byParent: Map<string | null, Comment[]>;
  depth: number;
}) {
  const children = byParent.get(c.id) ?? [];
  const isVerified = !!c.author_stub_user_id;
  const authorLine = isVerified ? (
    <>
      <span className="dv-text">{c.author_name_dv}</span>
      <span className="text-muted-foreground"> · {c.author_name_en}</span>
    </>
  ) : (
    <span className="font-mono">{c.anon_pseudonym}</span>
  );

  return (
    <li
      className={`bg-card border border-border p-4 ${depth > 0 ? "ms-6" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2 text-[11px] text-muted-foreground font-mono">
        <span className="flex items-baseline gap-2">
          {authorLine}
          <span
            className={`inline-block px-1.5 py-[1px] text-[9px] uppercase tracking-[0.12em] ${
              isVerified
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isVerified ? "eFaas" : "anon"}
          </span>
        </span>
        <time className="text-[10.5px]">
          {c.created_at.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      </div>
      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{c.body_en}</p>
      {c.body_dv && (
        <p className="dv-text text-[14px] leading-relaxed whitespace-pre-wrap mt-2 text-foreground/85">
          {c.body_dv}
        </p>
      )}
      {children.length > 0 && (
        <ul className="space-y-3 mt-3 pt-3 border-t border-border">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              byParent={byParent}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
