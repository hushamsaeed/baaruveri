import Link from "next/link";

// Fallback 404 for routes that bypass the [locale] segment (e.g.,
// requests that escape the proxy.ts middleware). Locale-aware 404s
// live in [locale]/not-found.tsx; this is the no-locale safety net.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", sans-serif',
          background: "#fbf8f3",
          color: "#1a1a1a",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6b7280",
              margin: 0,
              marginBottom: 12,
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, marginBottom: 16 }}>
            Page not found
          </h1>
          <p style={{ color: "#6b7280", lineHeight: 1.6, margin: 0, marginBottom: 24 }}>
            That URL doesn&rsquo;t resolve to anything on Baaruveri.
          </p>
          <Link href="/" style={{ color: "#3d6470", textDecoration: "underline" }}>
            → Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
