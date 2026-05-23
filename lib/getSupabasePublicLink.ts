const INVALID_IMAGE_VALUES = new Set(["", "null", "undefined"]);

function cleanPath(path: string | null | undefined) {
  const value = String(path ?? "").trim();
  return INVALID_IMAGE_VALUES.has(value.toLowerCase()) ? "" : value;
}

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export default function getSupabasePublicLink(
  path: string | null | undefined,
  bucket: string,
) {
  const clean = cleanPath(path);

  if (!clean) return null;
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/")
  ) {
    return clean;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL?.replace(/\/$/, "");

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/storage/v1/object/public/${bucket}/${encodeStoragePath(clean)}`;
}
