import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@@/lib/authOption";
import { prisma } from "@@/lib/prisma";
import { getEffectiveCourseSlots } from "@@/lib/courseDateUtils";

function stateColor(state: string) {
  if (state === "started") {
    return "Success";
  }
  if (state === "closed") {
    return "Danger";
  }
  return "Primary";
}

type CourseRow = {
  id: string;
  title: string;
  date_start: Date;
  date_end: Date;
  state: string;
  slots: { startsAt: Date; endsAt: Date; sortOrder: number }[];
};

const baseCourseSelect = {
  id: true,
  title: true,
  date_start: true,
  date_end: true,
  state: true,
} as const;

const slotsSelect = {
  orderBy: { sortOrder: "asc" as const },
  select: { startsAt: true, endsAt: true, sortOrder: true },
};

async function findCoursesWithSlotsOptional(where: {
  trainerId?: string;
  purchases?: { some: { userId: string } };
}): Promise<CourseRow[]> {
  try {
    return (await prisma.course.findMany({
      where,
      select: {
        ...baseCourseSelect,
        slots: slotsSelect,
      },
    })) as CourseRow[];
  } catch (err) {
    console.error(
      "[calendar-events] Requete avec slots impossible (migration ou schema). Nouvel essai sans relation CourseSlot.",
      err,
    );
    const rows = await prisma.course.findMany({
      where,
      select: { ...baseCourseSelect },
    });
    return rows.map((r) => ({
      ...r,
      slots: [],
    }));
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const role = session.user.role;

    let courses: CourseRow[] = [];

    if (role === "trainer") {
      const trainer = await prisma.trainer.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!trainer) {
        return NextResponse.json({ events: [] });
      }
      courses = await findCoursesWithSlotsOptional({ trainerId: trainer.id });
    } else {
      courses = await findCoursesWithSlotsOptional({
        purchases: { some: { userId: session.user.id } },
      });
    }

    const events: {
      id: string;
      title: string;
      start: string;
      end: string;
      extendedProps: { calendar: string; courseId: string };
    }[] = [];

    for (const c of courses) {
      const slotList = getEffectiveCourseSlots(c.slots, c.date_start, c.date_end);
      slotList.forEach((s, idx) => {
        events.push({
          id: `${c.id}-${idx}`,
          title: c.title,
          start: s.startsAt.toISOString(),
          end: s.endsAt.toISOString(),
          extendedProps: {
            calendar: stateColor(c.state),
            courseId: c.id,
          },
        });
      });
    }

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[calendar-events]", err);
    return NextResponse.json(
      {
        error: "Erreur serveur lors du chargement du calendrier.",
        events: [],
      },
      { status: 500 },
    );
  }
}
