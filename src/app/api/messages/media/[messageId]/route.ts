import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { prisma } from "@@/lib/prisma";
import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";
import { ensureUsersCanChat } from "@@/lib/trainerSubscriptions";

const MESSAGE_BUCKET = "messages";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

function extractStoragePath(mediaUrl: string | null) {
  if (!mediaUrl) {
    return null;
  }

  if (!mediaUrl.startsWith("http")) {
    return mediaUrl;
  }

  const marker = `/storage/v1/object/public/${MESSAGE_BUCKET}/`;
  const index = mediaUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(mediaUrl.slice(index + marker.length));
}

export async function GET(
  request: Request,
  context: { params: Promise<{ messageId: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { messageId } = await context.params;
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message || !message.mediaUrl) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  if (message.senderId !== userId && message.receiverId !== userId) {
    return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
  }

  try {
    await ensureUsersCanChat(message.senderId, message.receiverId);
  } catch {
    return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
  }

  const path = extractStoragePath(message.mediaUrl);

  if (!path) {
    return NextResponse.json({ error: "Chemin de fichier invalide." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(MESSAGE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Impossible de generer le lien securise." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.signedUrl);
}
