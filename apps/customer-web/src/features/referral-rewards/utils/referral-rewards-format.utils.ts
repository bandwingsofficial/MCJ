export function formatReferralCoins(amount: number, direction: "CREDIT" | "DEBIT") {
  const prefix = direction === "CREDIT" ? "+" : "-";
  return `${prefix}${amount} Coins`;
}

export function formatInrFromPaise(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatReferralDateTime(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTransactionTypeLabel(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildReferralRegisterPath(code: string) {
  return `/register?ref=${encodeURIComponent(code)}`;
}

export function buildReferralRegisterUrl(code: string) {
  if (typeof window === "undefined") {
    return buildReferralRegisterPath(code);
  }
  return `${window.location.origin}${buildReferralRegisterPath(code)}`;
}

export function buildReferralShareText(link: string) {
  return `Join MCJ Academy using my referral link:\n${link}`;
}
