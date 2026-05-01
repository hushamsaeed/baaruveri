import { describe, expect, it } from "vitest";
import { FLAGGED_ISSUE_TAGS, claimRequiresVerification } from "./claim-policy";

describe("claimRequiresVerification", () => {
  it("requires eFaas verification for judiciary threads", () => {
    expect(claimRequiresVerification("judiciary")).toBe(true);
  });

  it("does not require verification for ordinary issues", () => {
    expect(claimRequiresVerification("housing")).toBe(false);
    expect(claimRequiresVerification("climate")).toBe(false);
    expect(claimRequiresVerification("fisheries")).toBe(false);
    expect(claimRequiresVerification("education")).toBe(false);
    expect(claimRequiresVerification("decentralisation")).toBe(false);
    expect(claimRequiresVerification("procurement")).toBe(false);
  });

  it("FLAGGED_ISSUE_TAGS contains exactly the documented set", () => {
    expect([...FLAGGED_ISSUE_TAGS].sort()).toEqual(["judiciary"]);
  });
});
