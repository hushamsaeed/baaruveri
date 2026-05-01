import { describe, expect, it } from "vitest";
import { FLAGGED_ISSUE_TAGS, commentRequiresVerification } from "./comment-policy";

describe("commentRequiresVerification", () => {
  it("requires eFaas verification for judiciary threads", () => {
    expect(commentRequiresVerification("judiciary")).toBe(true);
  });

  it("does not require verification for ordinary issues", () => {
    expect(commentRequiresVerification("housing")).toBe(false);
    expect(commentRequiresVerification("climate")).toBe(false);
    expect(commentRequiresVerification("fisheries")).toBe(false);
    expect(commentRequiresVerification("education")).toBe(false);
    expect(commentRequiresVerification("decentralisation")).toBe(false);
    expect(commentRequiresVerification("procurement")).toBe(false);
  });

  it("FLAGGED_ISSUE_TAGS contains exactly the documented set", () => {
    expect([...FLAGGED_ISSUE_TAGS].sort()).toEqual(["judiciary"]);
  });
});
