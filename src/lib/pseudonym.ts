import { createHash } from "crypto";

// Per-thread anonymous pseudonyms. Deterministic from (anonId, threadId), so
// the same anon poster shows up consistently within one thread but no
// continuity across threads. Vocab leans on Maldivian sea life — recognisable
// to readers, neutral, no political weight.

const ADJECTIVES = [
  "yellow", "silver", "deep", "narrow", "gentle", "tidal", "coral", "lagoon",
  "shallow", "bright", "calm", "swift", "quiet", "rising", "falling", "open",
  "warm", "cool", "still", "drifting", "outer", "inner", "northern", "southern",
  "eastern", "western", "morning", "evening", "midday", "atoll", "reef",
  "sunlit", "shaded", "wide", "slim", "small", "great", "young", "old", "new",
];

// Maldivian / Indian-Ocean sea life. Latin-script for cross-language reading.
const SEALIFE = [
  "yellowfin", "grouper", "octopus", "jellyfish", "dolphin", "manta",
  "whaleshark", "parrotfish", "barracuda", "kingfish", "triggerfish",
  "snapper", "tuna", "mackerel", "marlin", "sailfish", "moray", "wrasse",
  "angelfish", "clownfish", "seabream", "lionfish", "stingray", "eagleray",
  "reefshark", "turtle", "puffer", "bonito", "rabbitfish", "surgeonfish",
  "trevally", "needlefish", "halibut", "milkfish", "scad", "sardine",
  "anchovy", "queenfish", "fusilier", "boxfish",
];

export function pseudonymFor(anonId: string, threadId: string): string {
  const h = createHash("sha256")
    .update(`${anonId}:${threadId}`)
    .digest();
  const a = ADJECTIVES[h[0] % ADJECTIVES.length];
  const s = SEALIFE[h[1] % SEALIFE.length];
  // 1-99 (avoiding 00, which reads as a placeholder)
  const n = (h[2] % 99) + 1;
  return `${a}-${s}-${String(n).padStart(2, "0")}`;
}
