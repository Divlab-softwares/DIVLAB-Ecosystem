"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import {
  getNotificationsChannel,
  NOTIFICATION_BROADCAST_EVENT,
} from "@@/lib/notificationRealtimeTypes";
import { supabaseBrowser } from "@@/lib/createSupabaseClient";

export type AppNotification = {
  id: string;
  description: string;
  subject: string;
  type: string;
  newNotif: boolean;
  createdAt: string;
  initiator: {
    id: string;
    name: string;
    surname?: string | null;
    email: string;
    image?: string | null;
    connected?: boolean;
  };
};

type NotificationState = {
  notifications: AppNotification[];
  unreadTotal: number;
  unreadByType: Record<string, number>;
};

const initialState: NotificationState = {
  notifications: [],
  unreadTotal: 0,
  unreadByType: {},
};

export function useRealtimeNotifications() {
  const { data: session } = useSession();
  const [state, setState] = useState<NotificationState>(initialState);
  const [loading, setLoading] = useState(true);
  const activeUserId = session?.user?.id ?? null;
  const accessToken = session?.accessToken;
  const loadedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!activeUserId) {
      setState(initialState);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/notifications", { cache: "no-store" });

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = await response.json();
    setState({
      notifications: data.notifications ?? [],
      unreadTotal: data.unreadTotal ?? 0,
      unreadByType: data.unreadByType ?? {},
    });
    setLoading(false);
    loadedRef.current = true;
  }, [activeUserId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!activeUserId || !accessToken) {
      return undefined;
    }

    supabaseBrowser.realtime.setAuth(accessToken);

    const channel = supabaseBrowser.channel(getNotificationsChannel(activeUserId), {
      config: { private: true },
    });

    channel
      .on("broadcast", { event: NOTIFICATION_BROADCAST_EVENT }, ({ payload }) => {
        const notification = payload as AppNotification;

        setState((current) => {
          if (current.notifications.some((item) => item.id === notification.id)) {
            return current;
          }

          const unreadByType = {
            ...current.unreadByType,
            [notification.type]: (current.unreadByType[notification.type] ?? 0) + 1,
          };

          return {
            notifications: [notification, ...current.notifications].slice(0, 40),
            unreadTotal: current.unreadTotal + 1,
            unreadByType,
          };
        });
      })
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(channel as RealtimeChannel);
    };
  }, [activeUserId, accessToken]);

  const markAllRead = useCallback(async () => {
    if (!activeUserId) {
      return;
    }

    setState((current) => ({
      notifications: current.notifications.map((notification) => ({
        ...notification,
        newNotif: false,
      })),
      unreadTotal: 0,
      unreadByType: {},
    }));

    await fetch("/api/notifications", { method: "PATCH" });
  }, [activeUserId]);

  return useMemo(
    () => ({
      ...state,
      loading: loading && !loadedRef.current,
      refresh,
      markAllRead,
    }),
    [loading, markAllRead, refresh, state],
  );
}
