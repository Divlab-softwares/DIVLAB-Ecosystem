export const NOTIFICATION_BROADCAST_EVENT = "notification";

export function getNotificationsChannel(userId: string) {
  return `notifications:${userId}`;
}
