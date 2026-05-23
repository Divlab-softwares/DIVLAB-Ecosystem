"use client";

import {
    //  useEffect,
      useRef } from "react";
import { Session } from "next-auth";

// declare global {
//     interface Window {
//         JitsiMeetExternalAPI: any;
//     }
// }

type Props = {
    roomName: string;
    // session: Session
};


export default function JitsiMeet({ roomName }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);


    // useEffect(() => {
    //     if (!containerRef.current) return;

    //     if (!window.JitsiMeetExternalAPI) {
    //         console.error("Jitsi API not loaded");
    //         return;
    //     }

    //     const domain = "meet.jit.si";

    //     const api = new window.JitsiMeetExternalAPI(domain, {
    //         roomName,
    //         parentNode: containerRef.current,
    //         width: "100%",
    //         height: "100%",
    //         userInfo: {
    //             displayName: session.user?.name || "Guest",
    //             email: session.user?.email || "",
    //         },

    //         configOverwrite: {
    //             enableWelcomePage: false,
    //             startWithAudioMuted: true,
    //             startWithVideoMuted: true,
    //             disableDeepLinking: true,
    //             prejoinPageEnabled: false,
    //             requireDisplayName: true,
    //         },
    //         interfaceConfigOverwrite: {
    //             APP_NAME: "DIVLAB Meet",
    //             SHOW_JITSI_WATERMARK: true, // ❌ ne peut pas être false sur meet.jit.si
    //             SHOW_WATERMARK_FOR_GUESTS: true,
    //             DEFAULT_BACKGROUND: "#0f172a",
    //         }
    //     });

    //     api.addEventListener("videoConferenceJoined", () => {
    //         api.executeCommand("password", "DIVLAB-2026");
    //     });

    //     return () => api.dispose();
    // }, [roomName, session.user?.email, session.user?.name]);


    return <div id={roomName} ref={containerRef} className="w-full h-full"/>;
}
