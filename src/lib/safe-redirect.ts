// Open-redirect guard for return_to / next-style form values.
// Same-origin path only — rejects:
//   - non-strings (FormData unset → null, file uploads → File)
//   - protocol-relative URLs ("//evil.com") which Location will honour
//   - backslash-prefixed paths ("/\evil.com") that some browsers parse
//     as protocol-relative
//   - absolute URLs ("https://evil.com")
// Next.js's redirect() honours any Location string verbatim, so this guard
// is the choke point.

export function isSafeReturnPath(
  value: FormDataEntryValue | string | null | undefined
): value is string {
  return typeof value === "string" && /^\/(?![\\/])/.test(value);
}
