import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

// v0 ships this as a TSX page. Will move to MDX once we wire the editor
// flow (post-v0); the prose stays the same — only the source format changes.
// Per project_v0_decisions.md #8 + reference_maldives_civic.md (civic space
// "obstructed"), users see this BEFORE they post.

export const metadata = {
  title: "Moderation policy — Baaruveri",
  description:
    "How conversation is held on Baaruveri: identity tiers, takedown protocol, threat model.",
};

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-12">
          <div className="text-[11px] text-muted-foreground uppercase tracking-[0.14em] mb-3 font-mono">
            About · v0 · effective 2026-05-01
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
            <span className="dv-text me-3 font-bold">މޮޑެރޭޝަން ޕޮލިސީ</span>
            <span>Moderation policy</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            How conversation is held on Baaruveri. Read this before you post —
            it explains what stays, what comes down, and how we handle the
            tension between accountability speech and a civic space rated
            <em className="not-italic font-medium text-foreground"> &nbsp;obstructed </em>
            by CIVICUS.
          </p>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 sm:px-10 py-12 prose prose-neutral text-[15px] leading-relaxed">
        <Section number="01" title="Two identity tiers, on purpose">
          <p>
            Baaruveri runs two parallel tiers of identity. Both are first-class;
            neither is a downgrade of the other.
          </p>
          <ul className="space-y-2 mt-3 list-disc ps-5">
            <li>
              <strong>Anonymous tier</strong> — for everyday civic speech:
              reading, voting, posting positions on threads, replying. No eFaas
              verification required. We don&rsquo;t log your IP. Rate limits use
              a device fingerprint that we cannot reverse to identify you.
            </li>
            <li>
              <strong>eFaas-verified tier</strong> — required for two acts:
              <strong> signing a petition</strong> (because the threshold mechanic
              has to be enforceable against the government, and that means each
              signature has to be unique and verifiable) and{" "}
              <strong>posting in flagged-issue threads</strong> (a small set of
              issue tags where coordinated inauthentic behaviour is most
              damaging — currently judiciary; the list is published below).
            </li>
          </ul>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Why two tiers and not one: forcing eFaas for everything would
            silence the people the platform exists to amplify. Allowing
            anonymity for everything would make threshold-triggered
            accountability mechanics unenforceable. Two tiers is the only
            shape that works for both jobs.
          </p>
        </Section>

        <Section number="02" title="Flagged-issue tags (verified-only posting)">
          <p>
            The following issue tags require eFaas verification to post (reading
            and voting are still anonymous). The list is public and changes go
            through a public deliberation:
          </p>
          <ul className="space-y-1 mt-3 list-disc ps-5">
            <li><strong>Judiciary</strong> — coordinated brigading observed in 2024-2025; verified posting reduces the harm without removing the conversation.</li>
          </ul>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            All other tags (housing, climate, fisheries, education,
            decentralisation, procurement) accept anonymous-tier posting in v0.
            The flagged list is reviewed every quarter with a public
            consultation thread before any addition.
          </p>
        </Section>

        <Section number="03" title="Reactive-only moderation in v0">
          <p>
            We do not pre-screen posts. The moderation flow is:
          </p>
          <ol className="space-y-1 mt-3 list-decimal ps-5">
            <li>Anyone reads, votes, posts.</li>
            <li>Anyone reports a post they think violates the policy.</li>
            <li>A human reviews within 24 hours (target; v0 has one moderator).</li>
            <li>If the post is removed, the action and the rationale go into a public takedown log (see §05).</li>
            <li>The author can appeal once; the appeal review goes into the same log.</li>
          </ol>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            We don&rsquo;t use automated moderation. We don&rsquo;t use ML
            classifiers to predict likely violations. The platform is small
            enough that a human reading is the right tool, and the cost of
            algorithmic errors against political speech is asymmetric.
          </p>
        </Section>

        <Section number="04" title="What gets removed">
          <p>The narrow list of removable content:</p>
          <ul className="space-y-2 mt-3 list-disc ps-5">
            <li><strong>Specific, credible threats of violence</strong> against an identifiable person.</li>
            <li><strong>Doxxing</strong> — publishing someone&rsquo;s NID, home address, phone number, or comparable PII without consent.</li>
            <li><strong>Sexual content involving minors</strong>, full stop.</li>
            <li><strong>Coordinated inauthentic behaviour</strong> proven via post-publication forensics (the same content posted from multiple accounts in a coordinated burst). Individual heated speech does not qualify.</li>
            <li><strong>Petition signature fraud</strong> — gaming the eFaas verification flow.</li>
          </ul>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Things we don&rsquo;t remove: criticism of public officials, claims
            that turn out to be wrong but were posted in good faith, sharp
            rhetoric, anonymous accusations against named institutions
            (institutions are not protected the same way individuals are).
          </p>
        </Section>

        <Section number="05" title="Takedown log — public, audit-ready">
          <p>
            Every removal lands in a public log. The log row includes: post
            permalink, timestamp of removal, the removable category from §04,
            the moderator&rsquo;s rationale (1-3 sentences), appeal status,
            and the original author&rsquo;s username (anon or verified).
          </p>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Takedown log lives at{" "}
            <Link
              href="/about/takedowns"
              className="text-primary underline underline-offset-2"
            >
              /about/takedowns
            </Link>{" "}
            — empty until the first takedown happens, then every row from
            then on. The log is the accountability mechanism on the
            moderation side: if you think we&rsquo;re removing the wrong
            things, the log is your evidence.
          </p>
        </Section>

        <Section number="06" title="Threat model — why the anon tier is real">
          <p>
            The Maldives civic space is rated{" "}
            <em className="not-italic font-medium">obstructed</em> by CIVICUS as
            of the 2024 monitoring cycle. That means there are credible,
            documented patterns of consequence for citizens who speak about
            specific institutions. Baaruveri&rsquo;s anonymous tier is built
            for that reality:
          </p>
          <ul className="space-y-2 mt-3 list-disc ps-5">
            <li>
              <strong>No IP logging on anon-tier posts.</strong> The reverse
              proxy strips X-Forwarded-For before the request reaches
              application code. We can&rsquo;t hand over what we don&rsquo;t
              keep.
            </li>
            <li>
              <strong>Device fingerprint, not user fingerprint.</strong> Rate
              limits use a hash of UA + screen geometry + a rotating salt. The
              hash isn&rsquo;t reversible to a person and rotates monthly.
            </li>
            <li>
              <strong>Takedown log is public.</strong> If a request to remove a
              post comes from a government channel, the request itself goes in
              the log alongside the action — citizens can see who asked.
            </li>
            <li>
              <strong>Verified tier is opt-in, never inferred.</strong> If you
              post anonymously about housing and verified about a petition,
              we don&rsquo;t link the two. The eFaas claim is scoped per
              action.
            </li>
          </ul>
        </Section>

        <Section number="07" title="What v0 does not yet do">
          <p>Honest scope cuts. These land post-v0:</p>
          <ul className="space-y-1 mt-3 list-disc ps-5">
            <li>Real eFaas OIDC integration (currently a stub).</li>
            <li>
              The takedown log page itself (the policy is in place; the public
              log lands when the first real takedown happens).
            </li>
            <li>
              Polis-style consensus clustering on contested threads (the data
              shape is ready; the UI lands when there are enough votes per
              claim to make the clustering meaningful).
            </li>
            <li>An appeals board independent of the platform team.</li>
          </ul>
        </Section>

        <Section number="08" title="Reaching the moderator">
          <p>
            One human reviews reports in v0. To reach them:
          </p>
          <ul className="space-y-1 mt-3 list-disc ps-5">
            <li>The <strong>Report</strong> button on any post (preferred — routes the post URL with your message).</li>
            <li>
              Email <code>moderation@baaruveri</code> for anything that
              doesn&rsquo;t fit the report flow (this is a v0 placeholder —
              real address lands with eFaas).
            </li>
          </ul>
          <p className="mt-3 text-[13.5px] text-muted-foreground">
            Response target: 24 hours for active reports, 7 days for appeals.
          </p>
        </Section>

        <p className="mt-12 pt-6 border-t border-border text-[11.5px] text-muted-foreground leading-relaxed">
          This policy is versioned in git alongside the rest of the codebase at
          {" "}
          <a
            href="https://github.com/hushamsaeed/baaruveri/blob/main/src/app/%5Blocale%5D/about/moderation/page.tsx"
            className="text-primary underline underline-offset-2"
          >
            hushamsaeed/baaruveri
          </a>
          . Changes go through a pull request with public review. The Dhivehi
          translation of this page is deferred — chrome is bilingual, body is
          English-primary in v0 per the content-fidelity rule (don&rsquo;t
          machine-translate consequential text into Dhivehi without review).
        </p>
      </article>
    </main>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[10.5px] text-muted-foreground tracking-[0.12em]">
          {number}
        </span>
        <h2 className="font-mono text-[12px] uppercase tracking-[0.14em] font-semibold m-0">
          {title}
        </h2>
      </div>
      <div className="text-foreground/90">{children}</div>
    </section>
  );
}
