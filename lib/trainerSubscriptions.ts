import { prisma } from "@@/lib/prisma";

export async function resolveTrainer(identifier: string) {
  if (!identifier) {
    return null;
  }

  return prisma.trainer.findFirst({
    where: {
      OR: [{ id: identifier }, { userId: identifier }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

export async function getActiveTrainerPair(leftUserId: string, rightUserId: string) {
  if (!leftUserId || !rightUserId || leftUserId === rightUserId) {
    return null;
  }

  const trainer = await prisma.trainer.findFirst({
    where: {
      userId: { in: [leftUserId, rightUserId] },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!trainer) {
    return null;
  }

  const subscriberId = trainer.userId === leftUserId ? rightUserId : leftUserId;

  const subscription = await prisma.trainerSubscription.findFirst({
    where: {
      trainerId: trainer.id,
      userId: subscriberId,
      status: "active",
    },
    select: {
      id: true,
      userId: true,
      trainerId: true,
      status: true,
    },
  });

  return subscription ? { trainer, subscriberId, subscription } : null;
}

export async function ensureUsersCanChat(leftUserId: string, rightUserId: string) {
  const pair = await getActiveTrainerPair(leftUserId, rightUserId);

  if (!pair) {
    throw new Error("MESSAGING_FORBIDDEN");
  }

  return pair;
}
