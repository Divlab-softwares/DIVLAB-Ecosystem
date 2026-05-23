import type { Prisma } from "@prisma/client";
import { prisma } from "@@/lib/prisma";

export const userProfileSelect = {
  id: true,
  name: true,
  surname: true,
  password: true,
  email: true,
  emailVerified: true,
  image: true,
  sex: true,
  location: true,
  post: true,
  phone: true,
  role: true,
  bio: true,
  createdAt: true,
  connected: true,
  postalCode: true,
  city: true,
  country: true,
  provider: true,
  socialMedias: {
    select: {
      id: true,
      name: true,
      link: true,
    },
  },
  trainer: {
    select: {
      id: true,
      userId: true,
      profession: true,
      country: true,
      domain: true,
      justification: true,
      justificatifDocument: true,
      identificationPiece: true,
      valid: true,
      reject: true,
      rejectReason: true,
    },
  },
} satisfies Prisma.UserSelect;

export async function getUserProfileById(userId: string) {
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });
}

export async function getUserProfileByEmail(email: string) {
  if (!email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: userProfileSelect,
  });
}
