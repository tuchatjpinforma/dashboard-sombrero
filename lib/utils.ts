export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export function extractNumber(whatsappId: string) {
  return String(whatsappId ?? "").replace("@s.whatsapp.net", "");
}

export function formatPhoneMasked(num: string) {
  const s = String(num ?? "").replace(/\D/g, "");
  if (s.length < 6) return num;
  return `+${s.slice(0, 2)} ${s[2]}XX XXX X${s.slice(-2)}`;
}
