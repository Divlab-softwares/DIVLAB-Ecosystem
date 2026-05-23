"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Session } from "next-auth";
import { supabaseBrowser } from "@@/lib/createSupabaseClient";
import {
  COURSE_BROADCAST_EVENT,
  type CourseBroadcastPayload,
} from "@@/lib/courseRealtimeTypes";

type UseCourseBroadcastOptions = {
  session: Session | null;
  channelName: string | null;
  onMessage: (payload: CourseBroadcastPayload) => void;
  isPrivate?: boolean;
};

export function useCourseBroadcast({
  session,
  channelName,
  onMessage,
  isPrivate = true,
}: UseCourseBroadcastOptions) {
  const callbackRef = useRef(onMessage);

  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!channelName) {
      return undefined;
    }

    if (isPrivate && !session?.accessToken) {
      return undefined;
    }

    if (isPrivate && session?.accessToken) {
      supabaseBrowser.realtime.setAuth(session.accessToken);
    }

    const channel = supabaseBrowser.channel(channelName, {
      config: { private: isPrivate },
    });

    channel
      .on("broadcast", { event: COURSE_BROADCAST_EVENT }, ({ payload }) => {
        callbackRef.current(payload as CourseBroadcastPayload);
      })
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(channel as RealtimeChannel);
    };
  }, [channelName, isPrivate, session?.accessToken]);
}
