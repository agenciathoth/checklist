export async function copyToClipboard(text: string) {
  return typeof navigator !== "undefined"
    ? navigator.clipboard.writeText(text)
    : null;
}
