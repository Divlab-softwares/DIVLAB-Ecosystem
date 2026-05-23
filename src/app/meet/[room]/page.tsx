"use client";

import {
//  useParams, 
    useSearchParams } from "next/navigation";
import JitsiMeet from "@/components/jitsiMeet/JitsiMeet";
import { useEffect, useState } from "react";
import { useSession
     } from "next-auth/react";

type Courses = {
    id: number,
    title: string,
    description: string,
    domain: string,
    state: string,
    date_start: string,
    date_end: string,
    roomCode: string,
    time: string,       // Image représentative
    price: number,  // Lien public du fichier
    trainerId: number,       // Image représentative
    createdAt: Date,
    updatedAt: string,
};

export default function MeetPage() {
     const sp = useSearchParams();

    // const params = useParams();
    const courseId = sp.get("courseId");
    const accessToken = sp.get("accessToken");

    // const courseId = params.courseId as string;
    // const accessToken = params.accessToken as string;

    const [course, setCourse] = useState<Courses | null>(null);

    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/formation?userId=" + session?.user?.id);

            if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

            const data = await res.json();

            interface Purchase {
                accessToken: string;
                formationId: string;
                paymentStatus: string;
                userId: string;
                formation: Courses;
            }

            // interface FetchResponse {
            //     purchase: Purchase[];
            //     success: boolean;
            //     data: Courses[];
            // }

            // // Then replace the selection with:
            // const typedData: FetchResponse = data;

            data.purchase.forEach((purchase: Purchase) => {
                if (purchase.accessToken === accessToken && purchase.formationId === courseId && purchase.paymentStatus === "paid" && purchase.userId === session?.user?.id) {
                    setCourse(purchase.formation);
                }
                // console.log("Purchase info:", accessToken, courseId, purchase.accessToken, purchase.formationId, purchase.paymentStatus, purchase.userId);
            });


            console.log("Joining room:", courseId);


        };

        fetchData();
    }, [courseId, accessToken, session]);

    if (status == "loading") {
        return <div>Loading...</div>;
    } else if (status == "unauthenticated") {
        return <div>Please sign in to access the meeting.</div>;
    }

    if (!course) {
        return <div>Vous n&apos; avez pas accès à cette formation.</div>;
    }

    if (course?.state === "not started") {
        return <div>The course is not started yet.</div>;
    }

    const room = course.roomCode!;

    return (
        <div className=" h-screen flex flex-col">
            {/* HEADER DIVLAB */}
            <header className="p-2.5 bg-slate-800 text-white ">
                
                <h2>DIVLAB – {course?.title}</h2>
            </header>

            {/* SALLE JITSI */}
            <div className="flex-1"> 
                <JitsiMeet roomName={room} />
            </div>
        </div>
    );
}
