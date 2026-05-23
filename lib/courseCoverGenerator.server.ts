import slugify from "slugify";

import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";

type GenerateCourseCoverInput = {
  origin: string;
  trainerId: string;
  variant: "front" | "back";
  title: string;
  description: string;
  date: string;
  language: string;
  instructor: string;
  price: number;
  currency: string;
  personUrl: string;
  time: string;
};

const COVER_BUCKET = "images";

function buildCoverUrl(input: GenerateCourseCoverInput) {
  const url = new URL("/api/generate-cover", input.origin);
  url.searchParams.set("variant", input.variant);
  url.searchParams.set("title", input.title);
  url.searchParams.set("description", input.description);
  url.searchParams.set("date", input.date);
  url.searchParams.set("language", input.language);
  url.searchParams.set("instructor", input.instructor);
  url.searchParams.set("price", String(input.price));
  url.searchParams.set("currency", input.currency);
  url.searchParams.set("personUrl", input.personUrl);
  url.searchParams.set("time", input.time);
  return url;
}

export async function generateCourseCoverBuffer(input: GenerateCourseCoverInput) {
  const response = await fetch(buildCoverUrl(input), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Generation de couverture impossible (${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function generateAndUploadCourseCover(input: GenerateCourseCoverInput) {
  const buffer = await generateCourseCoverBuffer(input);
  const supabase = getSupabaseAdminClient();
  const safeTitle = slugify(input.title || "formation", { lower: true, strict: true });
  const fileName = `${input.variant}Cover_auto_${Date.now()}_${safeTitle}.png`;
  const path = `covers/${input.trainerId}/generated/${fileName}`;

  const { error } = await supabase.storage.from(COVER_BUCKET).upload(path, buffer, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) {
    throw new Error(error.message || "Upload de la couverture generee impossible.");
  }

  return path;
}
