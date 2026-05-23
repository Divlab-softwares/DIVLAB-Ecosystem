import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import slugify from "slugify";

import { authOptions } from "@@/lib/authOption";
import { broadcastChatMessage } from "@@/lib/chatRealtime.server";
import { createAppNotification } from "@@/lib/notifications.server";
import { prisma } from "@@/lib/prisma";
import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";
import { ensureUsersCanChat } from "@@/lib/trainerSubscriptions";

const MESSAGE_BUCKET = "messages";
const MAX_MEDIA_SIZE = 25 * 1024 * 1024;

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function inferMessageType(file: File | null, fallback: string | null) {
  if (file?.type.startsWith("image/")) {
    return "image";
  }

  if (file?.type.startsWith("video/")) {
    return "video";
  }

  if (file) {
    return "file";
  }

  return fallback === "image" || fallback === "video" || fallback === "file"
    ? fallback
    : "text";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const senderId = session?.user?.id;

  if (!senderId) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const form = await request.formData();
  const receiverId = String(form.get("receiverId") ?? "");
  const content = String(form.get("content") ?? "").trim();
  const fallbackType = typeof form.get("type") === "string" ? String(form.get("type")) : null;
  const media = form.get("media");
  const file = media instanceof File && media.size > 0 ? media : null;
  const type = inferMessageType(file, fallbackType);

  if (!receiverId) {
    return NextResponse.json({ error: "Destinataire manquant." }, { status: 400 });
  }

  if (!content && !file) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  try {
    await ensureUsersCanChat(senderId, receiverId);
  } catch {
    return NextResponse.json(
      { error: "Messagerie reservee aux abonnes actifs." },
      { status: 403 },
    );
  }

  let mediaUrl: string | null = null;

  if (file) {
    if (file.size > MAX_MEDIA_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop lourd. Maximum 25 Mo." },
        { status: 400 },
      );
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Format non supporte pour la messagerie." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = slugify(file.name, { lower: true, strict: true }) || "media";
    const path = `${senderId}/${Date.now()}_${safeName}`;
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.storage.from(MESSAGE_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json(
        { error: "Upload impossible.", details: error.message },
        { status: 400 },
      );
    }

    mediaUrl = path;
  }

  const message = await prisma.chatMessage.create({
    data: {
      senderId,
      receiverId,
      content: content || (file ? file.name : ""),
      mediaUrl,
      type,
    },
  });

  const realtimeMessage = await broadcastChatMessage(message).catch((error) => {
    console.error("Chat broadcast failed:", error);
    return null;
  });

  await createAppNotification({
    initiatorUserId: senderId,
    destinatorUserId: receiverId,
    description: file ? "vous a envoye un fichier" : "vous a envoye un message",
    subject: content || file?.name || "Nouveau message",
    type: "message",
  });

  return NextResponse.json({ message: realtimeMessage ?? message });
}
