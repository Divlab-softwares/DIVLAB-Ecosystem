import { prisma } from "@@/lib/prisma";
import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";
import { DEFAULT_PROFILE_IMAGE, resolvePublicImage } from "@@/lib/imageSources";
import {
  getNotificationsChannel,
  NOTIFICATION_BROADCAST_EVENT,
} from "@@/lib/notificationRealtimeTypes";

type CreateNotificationInput = {
  initiatorUserId: string;
  destinatorUserId: string;
  description: string;
  subject: string;
  type: string;
};

function publicImage(path?: string | null) {
  return resolvePublicImage(path, "images", DEFAULT_PROFILE_IMAGE);
}

export function normalizeNotification(notification: {
  id: string;
  description: string;
  subject: string;
  type: string;
  newNotif: boolean;
  createdAt: Date;
  initiator: {
    id: string;
    name: string;
    surname?: string | null;
    email: string;
    image?: string | null;
    connected?: boolean;
  };
}) {
  return {
    id: notification.id,
    description: notification.description,
    subject: notification.subject,
    type: notification.type,
    newNotif: notification.newNotif,
    createdAt: notification.createdAt.toISOString(),
    initiator: {
      ...notification.initiator,
      image: publicImage(notification.initiator.image),
    },
  };
}

async function broadcastNotification(destinatorUserId: string, payload: unknown) {
  const supabaseAdmin = getSupabaseAdminClient();
  const channel = supabaseAdmin.channel(getNotificationsChannel(destinatorUserId), {
    config: { private: true },
  });

  const subscribed = await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), 4000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve(true);
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });

  if (subscribed) {
    await channel.send({
      type: "broadcast",
      event: NOTIFICATION_BROADCAST_EVENT,
      payload,
    });
  }

  await supabaseAdmin.removeChannel(channel);
}

export async function createAppNotification(input: CreateNotificationInput) {
  if (!input.initiatorUserId || !input.destinatorUserId) {
    return null;
  }

  if (input.initiatorUserId === input.destinatorUserId) {
    return null;
  }

  const notification = await prisma.notification.create({
    data: {
      initiatorUserId: input.initiatorUserId,
      destinatorUserId: input.destinatorUserId,
      description: input.description,
      subject: input.subject,
      type: input.type,
      newNotif: true,
    },
    include: {
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
    },
  });

  const payload = normalizeNotification(notification);

  await broadcastNotification(input.destinatorUserId, payload).catch((error) => {
    console.error("Notification broadcast failed:", error);
  });

  return payload;
}
