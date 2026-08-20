export const BLOCKED_KEYWORDS: string[] = [
  "drug",
  "drugs",
  "meth",
  "cocaine",
  "heroin",
  "kill",
  "murder",
  "bomb",
  "weapon",
  "gun",
  "firearm",
  "suicide",
  "self-harm",
  "self harm",
  "hack",
  "hacking",
  "exploit",
  "phishing",
  "fraud",
  "scam",
  "porn",
  "nude",
  "nsfw",
  "terror",
  "terrorism",
  "extremist",
  "radicalize",
];

interface SafetyCheckResult {
  blocked: boolean;
  keyword: string | null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isTopicAllowed(topic: string): SafetyCheckResult {
  const normalized = topic.toLowerCase();

  for (const keyword of BLOCKED_KEYWORDS) {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
    if (regex.test(normalized)) {
      return { blocked: true, keyword };
    }
  }

  return { blocked: false, keyword: null };
}
