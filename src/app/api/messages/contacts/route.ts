import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { getChatChannelName } from "@@/lib/chatRealtimeTypes";
import { DEFAULT_PROFILE_IMAGE, resolvePublicImage } from "@@/lib/imageSources";
import { prisma } from "@@/lib/prisma";

function publicImage(path?: string | null) {
  return resolvePublicImage(path, "images", DEFAULT_PROFILE_IMAGE);
}

type MessageContact = {
  id: string;
  subscriptionId: string;
  trainerId?: string;
  name: string;
  email: string;
  image: string | null;
  connected: boolean;
  role: "trainer" | "subscriber";
  channelName: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const outgoingSubscriptions = await prisma.trainerSubscription.findMany({
    where: { userId, status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      trainer: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              image: true,
              connected: true,
            },
          },
        },
      },
    },
  });

  const contacts: MessageContact[] = outgoingSubscriptions.map((subscription) => ({
    id: subscription.trainer.user.id,
    subscriptionId: subscription.id,
    trainerId: subscription.trainer.id,
    name: `${subscription.trainer.user.name} ${subscription.trainer.user.surname ?? ""}`.trim(),
    email: subscription.trainer.user.email,
    image: publicImage(subscription.trainer.user.image),
    connected: subscription.trainer.user.connected,
    role: "trainer" as const,
    channelName: getChatChannelName(userId, subscription.trainer.user.id),
  }));

  if (session.user.role === "trainer") {
    const ownTrainer = await prisma.trainer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!ownTrainer) {
      return NextResponse.json({ contacts });
    }

    const subscriberSubscriptions = await prisma.trainerSubscription.findMany({
      where: { trainerId: ownTrainer.id, status: "active" },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            image: true,
            connected: true,
          },
        },
      },
    });

    const byUserId = new Map(contacts.map((contact) => [contact.id, contact]));

    subscriberSubscriptions.forEach((subscription) => {
      if (byUserId.has(subscription.user.id)) {
        return;
      }

      byUserId.set(subscription.user.id, {
        id: subscription.user.id,
        subscriptionId: subscription.id,
        name: `${subscription.user.name} ${subscription.user.surname ?? ""}`.trim(),
        email: subscription.user.email,
        image: publicImage(subscription.user.image),
        connected: subscription.user.connected,
        role: "subscriber",
        channelName: getChatChannelName(userId, subscription.user.id),
      });
    });

    return NextResponse.json({
      contacts: [...byUserId.values()],
    });
  }

  return NextResponse.json({ contacts });
}
