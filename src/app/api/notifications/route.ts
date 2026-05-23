import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { normalizeNotification } from "@@/lib/notifications.server";
import { prisma } from "@@/lib/prisma";

function notificationSelect() {
  return {
    initiator: {
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        image: true,
        connected: true,
      },
    },
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { destinatorUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: notificationSelect(),
  });

  const counts = await prisma.notification.groupBy({
    by: ["type"],
    where: {
      destinatorUserId: userId,
      newNotif: true,
    },
    _count: { type: true },
  });

  const unreadByType = counts.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {});

  return NextResponse.json({
    notifications: notifications.map(normalizeNotification),
    unreadTotal: Object.values(unreadByType).reduce((sum, count) => sum + count, 0),
    unreadByType,
  });
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  await prisma.notification.updateMany({
    where: {
      destinatorUserId: userId,
      newNotif: true,
    },
    data: { newNotif: false },
  });

  return NextResponse.json({ ok: true });
}
