import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { DEFAULT_PROFILE_IMAGE, resolvePublicImage } from "@@/lib/imageSources";
import { createAppNotification } from "@@/lib/notifications.server";
import { prisma } from "@@/lib/prisma";
import { resolveTrainer } from "@@/lib/trainerSubscriptions";

function publicImage(path?: string | null) {
  return resolvePublicImage(path, "images", DEFAULT_PROFILE_IMAGE);
}

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return { session, userId: session?.user?.id ?? null };
}

export async function GET(request: Request) {
  const { session, userId } = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const trainerIdentifier = searchParams.get("trainerId");

  if (trainerIdentifier) {
    const trainer = await resolveTrainer(trainerIdentifier);

    if (!trainer) {
      return NextResponse.json({ status: "missing" });
    }

    const [subscription, blacklistEntry] = await Promise.all([
      prisma.trainerSubscription.findUnique({
        where: {
          userId_trainerId: {
            userId,
            trainerId: trainer.id,
          },
        },
        select: { id: true, status: true },
      }),
      prisma.trainerBlacklist.findUnique({
        where: {
          userId_trainerId: {
            userId,
            trainerId: trainer.id,
          },
        },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      status: blacklistEntry ? "blacklisted" : subscription?.status ?? "none",
      subscriptionId: subscription?.id ?? null,
      trainerId: trainer.id,
      trainerUserId: trainer.userId,
    });
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
              country: true,
              city: true,
            },
          },
        },
      },
    },
  });

  const subscriptions = outgoingSubscriptions.map((subscription) => ({
    id: subscription.id,
    status: subscription.status,
    createdAt: subscription.createdAt,
    trainer: {
      id: subscription.trainer.id,
      userId: subscription.trainer.userId,
      profession: subscription.trainer.profession,
      domain: subscription.trainer.domain,
      user: {
        ...subscription.trainer.user,
        image: publicImage(subscription.trainer.user.image),
      },
    },
  }));

  if (session?.user?.role === "trainer") {
    const ownTrainer = await prisma.trainer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!ownTrainer) {
      return NextResponse.json({ role: "trainer", subscriptions, subscribers: [] });
    }

    const subscribers = await prisma.trainerSubscription.findMany({
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
            country: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      role: "trainer",
      subscriptions,
      subscribers: subscribers.map((subscription) => ({
        id: subscription.id,
        status: subscription.status,
        createdAt: subscription.createdAt,
        user: {
          ...subscription.user,
          image: publicImage(subscription.user.image),
        },
      })),
    });
  }

  return NextResponse.json({
    role: "user",
    subscriptions,
    subscribers: [],
  });
}

export async function POST(request: Request) {
  const { userId } = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const trainer = await resolveTrainer(String(body.trainerId ?? ""));

  if (!trainer) {
    return NextResponse.json({ error: "Formateur introuvable." }, { status: 404 });
  }

  if (trainer.userId === userId) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas vous abonner a vous-meme." },
      { status: 400 },
    );
  }

  const isBlacklisted = await prisma.trainerBlacklist.findUnique({
    where: {
      userId_trainerId: {
        userId,
        trainerId: trainer.id,
      },
    },
  });

  if (isBlacklisted) {
    return NextResponse.json(
      { error: "Ce formateur a bloque votre abonnement." },
      { status: 403 },
    );
  }

  const subscription = await prisma.trainerSubscription.upsert({
    where: {
      userId_trainerId: {
        userId,
        trainerId: trainer.id,
      },
    },
    update: { status: "active" },
    create: {
      userId,
      trainerId: trainer.id,
      status: "active",
    },
  });

  await createAppNotification({
    initiatorUserId: userId,
    destinatorUserId: trainer.userId,
    description: "s'est abonne a votre profil formateur",
    subject: trainer.user.name,
    type: "subscription",
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(request: Request) {
  const { userId } = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const trainerIdentifier =
    body.trainerId ?? new URL(request.url).searchParams.get("trainerId");
  const trainer = await resolveTrainer(String(trainerIdentifier ?? ""));

  if (!trainer) {
    return NextResponse.json({ error: "Formateur introuvable." }, { status: 404 });
  }

  await prisma.trainerSubscription.deleteMany({
    where: {
      userId,
      trainerId: trainer.id,
    },
  });

  await createAppNotification({
    initiatorUserId: userId,
    destinatorUserId: trainer.userId,
    description: "s'est desabonne de votre profil formateur",
    subject: trainer.user.name,
    type: "subscription",
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { userId } = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action === "blacklist" ? "blacklist" : "ban";
  const subscriptionId = String(body.subscriptionId ?? "");

  const subscription = await prisma.trainerSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      trainer: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (!subscription || subscription.trainer.userId !== userId) {
    return NextResponse.json({ error: "Action non autorisee." }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.trainerSubscription.delete({
      where: { id: subscription.id },
    });

    if (action === "blacklist") {
      await tx.trainerBlacklist.upsert({
        where: {
          userId_trainerId: {
            userId: subscription.userId,
            trainerId: subscription.trainerId,
          },
        },
        update: {},
        create: {
          userId: subscription.userId,
          trainerId: subscription.trainerId,
        },
      });
    }
  });

  await createAppNotification({
    initiatorUserId: userId,
    destinatorUserId: subscription.userId,
    description:
      action === "blacklist"
        ? "vous a blacklist de ses abonnements"
        : "a supprime votre abonnement",
    subject: "Abonnement formateur",
    type: "subscription",
  });

  return NextResponse.json({ ok: true, action });
}
