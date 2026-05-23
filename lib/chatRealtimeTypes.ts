export const CHAT_BROADCAST_EVENT = "chat-message";

export function getChatChannelName(leftUserId: string, rightUserId: string) {
  return `messages:${[leftUserId, rightUserId].sort().join(":")}`;
}
