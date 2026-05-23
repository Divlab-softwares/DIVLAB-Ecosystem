import getSupabasePublicLink from "./getSupabasePublicLink";

export const DEFAULT_FRONT_COVER = "/images/default/default_frontCover2.jpeg";
export const DEFAULT_BACK_COVER = "/images/default/default_backCover.jpeg";
export const DEFAULT_PROFILE_IMAGE = "/images/user/user-profile2.png";

const INVALID_IMAGE_VALUES = new Set(["", "null", "undefined"]);

export function isValidImageSrc(src: string | null | undefined) {
  const value = String(src ?? "").trim();

  if (INVALID_IMAGE_VALUES.has(value.toLowerCase())) {
    return false;
  }

  return (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  );
}

export function resolvePublicImage(
  path: string | null | undefined,
  bucket = "images",
  fallback = DEFAULT_PROFILE_IMAGE,
) {
  const publicUrl = getSupabasePublicLink(path, bucket);

  if (isValidImageSrc(publicUrl)) {
    return publicUrl as string;
  }

  return fallback;
}

export function shouldBypassNextImageCache(src: string | null | undefined) {
  const value = String(src ?? "").trim();
  return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/api/");
}
