import { CHAT_BROADCAST_EVENT, getChatChannelName } from "@@/lib/chatRealtimeTypes";
import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";

type ChatMessagePayload = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string | null;
  type: string;
  createdAt: Date | string;
};

export function normalizeChatMessage(message: ChatMessagePayload) {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    content: message.content,
    mediaUrl: message.mediaUrl ? `/api/messages/media/${message.id}` : null,
    type: message.type,
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt.toISOString()
        : message.createdAt,
  };
}

export async function broadcastChatMessage(message: ChatMessagePayload) {
  const payload = normalizeChatMessage(message);
  const supabaseAdmin = getSupabaseAdminClient();
  const channel = supabaseAdmin.channel(
    getChatChannelName(message.senderId, message.receiverId),
    { config: { private: true } },
  );

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
      event: CHAT_BROADCAST_EVENT,
      payload,
    });
  }

  await supabaseAdmin.removeChannel(channel);
  return payload;
}
