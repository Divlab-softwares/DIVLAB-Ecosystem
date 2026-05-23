export type DateLike = Date | string | number | null | undefined;

function toDateParts(value: DateLike) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }

    return {
      year: value.getFullYear(),
      month: value.getMonth(),
      day: value.getDate(),
    };
  }

  if (typeof value === "string") {
    const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDateMatch) {
      return {
        year: Number(isoDateMatch[1]),
        month: Number(isoDateMatch[2]) - 1,
        day: Number(isoDateMatch[3]),
      };
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth(),
    day: parsed.getDate(),
  };
}

export function coerceDate(value: DateLike) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isSameCalendarDay(left: DateLike, right: DateLike) {
  const leftParts = toDateParts(left);
  const rightParts = toDateParts(right);

  if (!leftParts || !rightParts) {
    return false;
  }

  return (
    leftParts.year === rightParts.year &&
    leftParts.month === rightParts.month &&
    leftParts.day === rightParts.day
  );
}

export function formatCourseDate(value: DateLike, locale = "fr-FR") {
  const parts = toDateParts(value);
  if (!parts) {
    return "";
  }

  return new Intl.DateTimeFormat(locale).format(
    new Date(parts.year, parts.month, parts.day),
  );
}

export function toLocalISOString(value: DateLike) {
  const date = coerceDate(value);
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  const timezoneOffsetMinutes = -date.getTimezoneOffset();
  const offsetSign = timezoneOffsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(timezoneOffsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(absoluteOffset % 60).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

function formatHourMinuteFr(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  if (m === 0) {
    return `${String(h).padStart(2, "0")}h`;
  }
  return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
}

/** Ex. "Le 12/05/2026 de 09h à 17h" (fuseau local). */
export function formatSlotRangeFr(startsAt: DateLike, endsAt: DateLike, locale = "fr-FR") {
  const start = coerceDate(startsAt);
  const end = coerceDate(endsAt);
  if (!start || !end) {
    return "";
  }

  const datePart = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(start);

  return `Le ${datePart} de ${formatHourMinuteFr(start)} à ${formatHourMinuteFr(end)}`;
}

export type SlotLike = { startsAt: DateLike; endsAt: DateLike; sortOrder?: number };

/** Créneaux effectifs : table `slots` si présente, sinon un seul créneau date_start → date_end. */
export function getEffectiveCourseSlots<T extends SlotLike>(
  slots: T[] | null | undefined,
  date_start: DateLike,
  date_end: DateLike,
): { startsAt: Date; endsAt: Date }[] {
  const ordered = [...(slots ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const parsed = ordered
    .map((s) => ({
      startsAt: coerceDate(s.startsAt),
      endsAt: coerceDate(s.endsAt),
    }))
    .filter((s): s is { startsAt: Date; endsAt: Date } =>
      Boolean(s.startsAt && s.endsAt && s.endsAt > s.startsAt),
    );

  if (parsed.length > 0) {
    return parsed;
  }

  const ds = coerceDate(date_start);
  const de = coerceDate(date_end);
  if (ds && de && de > ds) {
    return [{ startsAt: ds, endsAt: de }];
  }

  if (ds && de) {
    return [{ startsAt: ds, endsAt: de }];
  }

  return [];
}
