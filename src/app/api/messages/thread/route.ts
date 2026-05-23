import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { normalizeChatMessage } from "@@/lib/chatRealtime.server";
import { prisma } from "@@/lib/prisma";
import { ensureUsersCanChat } from "@@/lib/trainerSubscriptions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const contactId = new URL(request.url).searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json({ error: "Contact manquant." }, { status: 400 });
  }

  try {
    await ensureUsersCanChat(userId, contactId);
  } catch {
    return NextResponse.json(
      { error: "Messagerie reservee aux abonnes actifs." },
      { status: 403 },
    );
  }

  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({
    messages: messages.map(normalizeChatMessage),
  });
}
