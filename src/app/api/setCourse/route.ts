import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { prisma } from "@@/lib/prisma";
import { generateAndUploadCourseCover } from "@@/lib/courseCoverGenerator.server";
import { generateRoom } from "@@/lib/generateRoom";
import { revalidatePath, revalidateTag } from "next/cache";
import slugify from "slugify";
import { broadcastCourseChange } from "@@/lib/courseRealtime.server";
import getSupabasePublicLink from "@@/lib/getSupabasePublicLink";
import {
  boundsFromSlots,
  parseSlotsJson,
  totalMinutesFromSlots,
  validateSlots,
} from "@@/lib/courseSlotPayload";
import {
  normalizeCourseCurrency,
  NOTCHPAY_SUPPORTED_CURRENCIES,
} from "@@/lib/notchpay";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = "images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["image/avif", "image/webp", "image/svg+xml", "image/jpg", "image/jpeg", "image/png", "application/pdf"];

function validateFile(file: File | null) {
  if (!file) return "Fichier manquant";
  if (file.size > MAX_FILE_SIZE) {
    return `Le fichier ${file.name} est trop lourd (max 5Mo)`;
  }

  if (!ALLOWED_EXTENSIONS.includes(file.type)) {
    return `Format non supporte pour "${file.name}" (AVIF, WEBP, SVG, JPG, PNG, PDF uniquement)`;
  }

  return null;
}

function getStringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : null;
}

function parseDateValue(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatCoverDate(value: Date | null) {
  if (!value) {
    return "Date a definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

function getTime(value: Date | null) {
  if (!value) {
    return "Heure a definir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getRequestOrigin(req: Request) {
  try {
    return new URL(req.url).origin;
  } catch {
    // Continue with forwarded headers below.
  }

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const userId = getStringValue(form.get("userId"));
  const courseId = getStringValue(form.get("courseId"));

  if (!userId) {
    return NextResponse.json({ error: "userId manquant." }, { status: 400 });
  }

  const title = getStringValue(form.get("title"));
  const duration = getStringValue(form.get("duration"));
  const domain = getStringValue(form.get("domain"));
  const price = getStringValue(form.get("price"));
  const language = getStringValue(form.get("language"));
  const description = getStringValue(form.get("description"));
  const dateStart = getStringValue(form.get("date_start"));
  const dateEnd = getStringValue(form.get("date_end"));
  const currency = getStringValue(form.get("currency"));
  const singleDate = getStringValue(form.get("date"));
  const slotsRaw = form.get("slotsJson");
  const slotsJsonString = typeof slotsRaw === "string" ? slotsRaw : null;
  const slotsInput = slotsJsonString ? parseSlotsJson(slotsJsonString) : null;
  const autoGenerateFrontCover = getStringValue(form.get("autoGenerateFrontCover")) === "true";
  const autoGenerateBackCover = getStringValue(form.get("autoGenerateBackCover")) === "true";

  const safeTitle = title ?? "course";
  const roomSeed = courseId ?? `draft-${Date.now()}`;

  const parsedDateStart = parseDateValue(dateStart);
  const parsedDateEnd = parseDateValue(dateEnd);
  const parsedSingleDate = parseDateValue(singleDate);

  if (slotsInput && slotsInput.length > 0) {
    const slotError = validateSlots(slotsInput);
    if (slotError) {
      return NextResponse.json({ error: slotError }, { status: 400 });
    }
    const bounds = boundsFromSlots(slotsInput);
    if (!bounds) {
      return NextResponse.json({ error: "Créneaux invalides." }, { status: 400 });
    }
  } else {
    if ((dateStart && !parsedDateStart) || (dateEnd && !parsedDateEnd) || (singleDate && !parsedSingleDate)) {
      return NextResponse.json({ error: "Format de date invalide." }, { status: 400 });
    }

    if (parsedDateStart && parsedDateEnd && parsedDateEnd <= parsedDateStart) {
      return NextResponse.json(
        { error: "La date de fin doit etre apres la date de debut." },
        { status: 400 },
      );
    }
  }

  let effectiveStart = parsedDateStart;
  let effectiveEnd = parsedDateEnd;
  let effectiveDuration = duration ? parseInt(duration, 10) : null;

  if (slotsInput && slotsInput.length > 0) {
    const bounds = boundsFromSlots(slotsInput)!;
    effectiveStart = bounds.date_start;
    effectiveEnd = bounds.date_end;
    effectiveDuration = totalMinutesFromSlots(slotsInput);
  }

  const data = {
    title,
    duration: effectiveDuration,
    domain,
    price: price ? parseFloat(price) : null,
    language,
    roomCode: generateRoom(roomSeed, safeTitle),
    description,
    date_start: effectiveStart,
    date_end: effectiveEnd,
    currency,
    date: parsedSingleDate,
  };

  if (!data.title?.trim()) {
    return NextResponse.json({ error: "Le titre est obligatoire." }, { status: 400 });
  }

  if (!data.domain?.trim()) {
    return NextResponse.json({ error: "Le domaine est obligatoire." }, { status: 400 });
  }

  if (!data.language?.trim()) {
    return NextResponse.json({ error: "La langue est obligatoire." }, { status: 400 });
  }

  if (!data.description?.trim()) {
    return NextResponse.json({ error: "La description est obligatoire." }, { status: 400 });
  }

  if ((data.price ?? 0) < 0) {
    return NextResponse.json(
      { error: "Le prix ne peut pas etre negatif." },
      { status: 400 },
    );
  }

  const normalizedCurrency = normalizeCourseCurrency(data.currency);

  if ((data.price ?? 0) > 0) {
    if (!normalizedCurrency) {
      return NextResponse.json(
        {
          error: `Devise invalide pour un cours payant. Devises supportees: ${NOTCHPAY_SUPPORTED_CURRENCIES.join(", ")}.`,
        },
        { status: 400 },
      );
    }
  }

  const frontCover = form.get(`${safeTitle}${courseId ?? ""}-frontCover`);
  const backCover = form.get(`${safeTitle}${courseId ?? ""}-backCover`);

  const existingTrainer = await prisma.trainer.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
          image: true,
        },
      },
    },
  });

  if (!existingTrainer) {
    return NextResponse.json(
      { error: "Ce formateur n'existe pas." },
      { status: 400 },
    );
  }

  if (frontCover instanceof File) {
    const error = validateFile(frontCover);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
  }

  if (backCover instanceof File) {
    const error = validateFile(backCover);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
  }

  const origin = getRequestOrigin(req);
  const instructorName = `${existingTrainer.user.name} ${existingTrainer.user.surname ?? ""}`.trim();
  const coverPayload = {
    origin,
    trainerId: existingTrainer.id,
    title: data.title ?? "",
    description: data.description ?? "",
    date: formatCoverDate(data.date_start ?? data.date ?? null),
    time: getTime(data.date_start ?? data.date ?? null),
    language: data.language ?? "Francais",
    instructor: instructorName || "DIVLAB Trainer",
    price: data.price ?? 0,
    personUrl: getSupabasePublicLink(existingTrainer.user.image , "images") || `${origin}/images/user/user-profile2.png`,
    currency:
      (data.price ?? 0) > 0
        ? normalizedCurrency ?? data.currency ?? "FCFA"
        : data.currency ?? "FCFA",
  };

  // console.log("coverpayload value during autogenerate", coverPayload)

  let frontCoverPath = "";
  let backCoverPath = "";

  if (autoGenerateFrontCover && !frontCoverPath) {
    frontCoverPath = await generateAndUploadCourseCover({
      ...coverPayload,
      variant: "front",
    });
  }

  if (autoGenerateBackCover && !backCoverPath) {
    backCoverPath = await generateAndUploadCourseCover({
      ...coverPayload,
      variant: "back",
    });
  }

  if (frontCover instanceof File) {
    const buffer = Buffer.from(await frontCover.arrayBuffer());
    const fileName = `frontCover_${Date.now()}_${slugify(frontCover.name)}`;
    frontCoverPath = `covers/${existingTrainer.id}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(frontCoverPath, buffer, {
      contentType: frontCover.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload", details: error },
        { status: 400 },
      );
    }
  }

  if (backCover instanceof File) {
    const buffer = Buffer.from(await backCover.arrayBuffer());
    const fileName = `backCover_${Date.now()}_${slugify(backCover.name)}`;
    backCoverPath = `covers/${existingTrainer.id}/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(backCoverPath, buffer, {
      contentType: backCover.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload", details: error },
        { status: 400 },
      );
    }
  }

  if (courseId) {
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Cette formation n'existe pas." },
        { status: 400 },
      );
    }

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title ?? existingCourse.title,
        time: data.duration ?? existingCourse.time,
        domain: data.domain ?? existingCourse.domain,
        price: data.price == null ? existingCourse.price : data.price,
        language: data.language ?? existingCourse.language,
        description: data.description ?? existingCourse.description,
        date_start: data.date_start ?? data.date ?? existingCourse.date_start,
        date_end: data.date_end ?? data.date ?? existingCourse.date_end,
        currency:
          (data.price ?? existingCourse.price) > 0
            ? normalizedCurrency ?? existingCourse.currency
            : data.currency ?? existingCourse.currency,
        roomCode: data.roomCode ?? existingCourse.roomCode,
        frontCover: frontCoverPath || existingCourse.frontCover,
        backCover: backCoverPath || existingCourse.backCover,
        updatedAt: new Date(),
      },
    });

    if (slotsInput && slotsInput.length > 0) {
      await prisma.$transaction([
        prisma.courseSlot.deleteMany({ where: { courseId } }),
        prisma.courseSlot.createMany({
          data: slotsInput.map((s, i) => ({
            courseId,
            startsAt: new Date(s.startsAt),
            endsAt: new Date(s.endsAt),
            sortOrder: i,
          })),
        }),
      ]);
    }

    revalidateTag("courses", "default");
    revalidatePath("/available_courses");
    revalidatePath("/courses_state");
    revalidatePath("/my_courses");
    await broadcastCourseChange(courseId, "course.updated");
  } else {
    const createdCourse = await prisma.course.create({
      data: {
        title: data.title ?? "",
        time: data.duration || 0,
        domain: data.domain ?? "",
        price: data.price == null ? 0 : data.price,
        language: data.language ?? "Francais",
        description: data.description ?? "",
        roomCode: data.roomCode,
        currency: (data.price ?? 0) > 0 ? normalizedCurrency ?? "XAF" : data.currency ?? "FCFA",
        frontCover: frontCoverPath || "",
        backCover: backCoverPath || "",
        trainer: { connect: { id: existingTrainer.id } },
        ...(data.date_start ? { date_start: data.date_start } : {}),
        ...(data.date_end ? { date_end: data.date_end } : {}),
        ...(!data.date_end && !data.date_start && data.date
          ? { date_start: data.date, date_end: data.date }
          : {}),
      },
    });

    if (slotsInput && slotsInput.length > 0) {
      await prisma.courseSlot.createMany({
        data: slotsInput.map((s, i) => ({
          courseId: createdCourse.id,
          startsAt: new Date(s.startsAt),
          endsAt: new Date(s.endsAt),
          sortOrder: i,
        })),
      });
    }

    revalidateTag("courses", "default");
    revalidatePath("/available_courses");
    revalidatePath("/courses_state");
    revalidatePath("/my_courses");
    await broadcastCourseChange(createdCourse.id, "course.created");
  }

  return NextResponse.json({ ok: true });
}
