import { describe, expect, it } from "vitest";
import { isSafeReturnPath } from "./safe-redirect";

describe("isSafeReturnPath", () => {
  it("accepts ordinary same-origin paths", () => {
    expect(isSafeReturnPath("/")).toBe(true);
    expect(isSafeReturnPath("/atlas")).toBe(true);
    expect(isSafeReturnPath("/atlas/maafaru")).toBe(true);
    expect(isSafeReturnPath("/sandbar/thread-1?view=pros")).toBe(true);
  });

  it("rejects protocol-relative URLs (the original CVE)", () => {
    expect(isSafeReturnPath("//evil.com")).toBe(false);
    expect(isSafeReturnPath("//evil.com/path")).toBe(false);
  });

  it("rejects backslash-prefixed paths some browsers normalise", () => {
    expect(isSafeReturnPath("/\\evil.com")).toBe(false);
    expect(isSafeReturnPath("/\\\\evil.com")).toBe(false);
  });

  it("rejects absolute URLs and other schemes", () => {
    expect(isSafeReturnPath("https://evil.com")).toBe(false);
    expect(isSafeReturnPath("http://evil.com")).toBe(false);
    expect(isSafeReturnPath("javascript:alert(1)")).toBe(false);
    expect(isSafeReturnPath("data:text/html,foo")).toBe(false);
  });

  it("rejects relative paths and empty strings", () => {
    expect(isSafeReturnPath("atlas")).toBe(false);
    expect(isSafeReturnPath("./atlas")).toBe(false);
    expect(isSafeReturnPath("../admin")).toBe(false);
    expect(isSafeReturnPath("")).toBe(false);
  });

  it("rejects non-string FormData values", () => {
    expect(isSafeReturnPath(null)).toBe(false);
    expect(isSafeReturnPath(undefined)).toBe(false);
  });
});
