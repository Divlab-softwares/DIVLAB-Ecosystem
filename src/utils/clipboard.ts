export async function copyToClipboard(value: string): Promise<boolean> {
  if (!value.trim()) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
