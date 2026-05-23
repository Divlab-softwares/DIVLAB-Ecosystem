import type { DateLike, SlotLike } from "./courseDateUtils";
import { coerceDate, getEffectiveCourseSlots } from "./courseDateUtils";

export type CourseSlotInput = { startsAt: string; endsAt: string };

export function parseSlotsJson(raw: string | null): CourseSlotInput[] | null {
  if (!raw || raw.trim() === "") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const out: CourseSlotInput[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        "startsAt" in item &&
        "endsAt" in item &&
        typeof (item as CourseSlotInput).startsAt === "string" &&
        typeof (item as CourseSlotInput).endsAt === "string"
      ) {
        out.push({
          startsAt: (item as CourseSlotInput).startsAt,
          endsAt: (item as CourseSlotInput).endsAt,
        });
      }
    }

    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

export function validateSlots(slots: CourseSlotInput[]): string | null {
  if (slots.length === 0) {
    return "Au moins un créneau horaire est requis.";
  }

  for (let i = 0; i < slots.length; i++) {
    const s = coerceDate(slots[i].startsAt);
    const e = coerceDate(slots[i].endsAt);
    if (!s || !e) {
      return `Créneau ${i + 1} : dates invalides.`;
    }
    if (e <= s) {
      return `Créneau ${i + 1} : l'heure de fin doit être après l'heure de début.`;
    }
  }

  return null;
}

/** Somme des durées en minutes (pour le champ `time`). */
export function totalMinutesFromSlots(slots: CourseSlotInput[]): number {
  let total = 0;
  for (const row of slots) {
    const s = coerceDate(row.startsAt);
    const e = coerceDate(row.endsAt);
    if (s && e && e > s) {
      total += Math.round((e.getTime() - s.getTime()) / 60000);
    }
  }
  return total;
}

export function boundsFromSlots(slots: CourseSlotInput[]): {
  date_start: Date;
  date_end: Date;
} | null {
  const dates: Date[] = [];
  for (const row of slots) {
    const s = coerceDate(row.startsAt);
    const e = coerceDate(row.endsAt);
    if (s && e && e > s) {
      dates.push(s, e);
    }
  }
  if (dates.length === 0) {
    return null;
  }
  return {
    date_start: new Date(Math.min(...dates.map((d) => d.getTime()))),
    date_end: new Date(Math.max(...dates.map((d) => d.getTime()))),
  };
}

export function slotsFromLegacyRange(dateStart: Date, dateEnd: Date): CourseSlotInput[] {
  return [
    {
      startsAt: dateStart.toISOString(),
      endsAt: dateEnd.toISOString(),
    },
  ];
}

export function toSerializableSlots(
  slots: SlotLike[] | null | undefined,
  date_start: DateLike,
  date_end: DateLike,
): CourseSlotInput[] {
  const effective = getEffectiveCourseSlots(slots, date_start, date_end);
  return effective.map((s) => ({
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt.toISOString(),
  }));
}
