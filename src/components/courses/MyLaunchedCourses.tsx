"use client";

import React, { useState } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageBreadcrumb from "../common/PageBreadCrumb";
import RefreshButton from "../common/RefreshButton";
import Button from "../ui/button/Button";
import { useLocale } from "@/context/LocaleContext";
import CourseCard from "@/components/courses/CourseCard";
import CourseSkeleton from "@/components/skeletons/courses/CourseSkeleton";
import { generateRoom } from "@@/lib/generateRoom";
import { getCourses } from "@@/lib/getCourses";
import { setModaratorActif } from "@@/lib/setModeratorActif";
import {
  getTrainerCoursesChannel,
  type RealtimeCourse,
} from "@@/lib/courseRealtimeTypes";
import { useCourseBroadcast } from "@/hooks/useCourseBroadcast";
import getSupabasePublicLink from "@@/lib/getSupabasePublicLink";
import ClipLoader from "react-spinners/ClipLoader";

type Props = {
  session: Session | null;
};

export default function MyLaunchedCourses({ session }: Props) {
  const { t } = useLocale();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false)
  const [isWindowActif, setIsWindowActif] = useState(false)
  const {
    data: courses = [],
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryFn: () => getCourses(session?.user?.id || "invite"),
    queryKey: ["launchedCourses", session?.user?.id],
    enabled: !!session?.user?.id,
    refetchOnMount: "always",
    staleTime: 15_000,
  });

  const { mutateAsync: updateModeratorMutation } = useMutation({
    mutationFn: setModaratorActif,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["launchedCourses", session?.user?.id],
      });
    },
  });

  useCourseBroadcast({
    session,
    channelName: session?.user?.id ? getTrainerCoursesChannel(session.user.id) : null,
    onMessage: () => {
      // On refetch la liste pour couvrir creations, edits et changements d'etat.
      void queryClient.invalidateQueries({
        queryKey: ["launchedCourses", session?.user?.id],
      });
    },
  });

  if (!session) {
    return <div>{t("courses.signInRequired")}</div>;
  }

  async function startCourse(course: RealtimeCourse) {

    const roomCode = course.roomCode || generateRoom(course.id, course.title);
    const userDisplayName = session?.user?.name || "Apprenant";
    const roomPassword = "monCode";
    const options = [
      `userInfo.displayName="${userDisplayName}_${session?.user?.id}"`,
      `config.startWithAudioMuted=true`,
      `config.prejoinPageEnabled=false`,
      `config.disableDeepLinking=true`,
      `config.roomPassword="${roomPassword}"`,
    ].join("&");

    const meetingWindow = window.open(`https://meet.jit.si/${roomCode}#${options}`, "_blank");
    setIsWindowActif(true)
    await updateModeratorMutation(course.id);

    const response = await fetch("/api/logs/course-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: course.id,
        userId: session?.user?.id,
        token: "admin",
        role: session?.user?.role || "participant",
        action: "join",
      }),
    });

    if (!response.ok) {
      alert("Erreur lors de l'enregistrement de votre accÃ¨s. Veuillez rÃ©essayer.");
    }
    // On vérifie toutes les 2 min si la fenêtre est encore ouverte
    const checkWindow = setInterval(() => {
      if (meetingWindow?.closed) {
        clearInterval(checkWindow);
        console.log("L'utilisateur a fermé l'onglet de formation.");
        // Ici, tu peux mettre à jour ton état en base de données via une API
        setIsWindowActif(false)
      } else {
        console.log("L'utilisateur est toujours en rÃ©union.", course.title);
      }
    }, 2000);

  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t("courses.launchedTitle")} />
      <div className="mb-4 flex justify-end">
        <RefreshButton
          isRefreshing={isFetching}
          onRefresh={() => void refetch()}
          label="Rafraichir"
        />
      </div>

      {(isLoading || (isFetching && Array.isArray(courses) && courses.length === 0)) ? (
        <CourseSkeleton />
      ) : Array.isArray(courses) && courses.length !== 0 ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {courses.map((course, index) => {
            const isLocked = course.state !== "started";

            return (
              <div
                key={course.id}
                id={course.id}
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 60, 240)}
              >
                <CourseCard
                  priority={index < 2}
                  title={course.title}
                  domain={course.domain}
                  frontCover={course.frontCover}
                  time={course.time}
                  price={course.price}
                  currency={course.currency}
                  language={course.language}
                  state={course.state}
                  dateStart={course.date_start}
                  dateEnd={course.date_end}
                  participants={course.participants}
                  trainerHref={{
                    pathname: "/profile",
                    query: { trainerId: session.user?.id },
                  }}
                  trainer={{
                    id: session.user?.id || "trainer",
                    name: session.user?.name || t("common.unknown"),
                    image: getSupabasePublicLink(session.user?.image ? session.user?.image : "", "images") || "/images/user/user-profile2.png",
                  }}
                  detailsHref={{
                    pathname: "/course_details",
                    query: { courseId: course.id },
                  }}
                  bodyExtra={
                    course.participants !== 0 ? (
                      <Link
                        href={{
                          pathname: "/audience",
                          query: { courseId: course.id },
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-200"
                      >
                        {t("courses.viewParticipants")}
                      </Link>
                    ) : null
                  }
                  footer={
                    <div className="grid gap-3 md:grid-cols-2">
                      <Link
                        href={{
                          pathname: "/launch_courses",
                          query: { courseId: course.id },
                        }}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full" onClick={() => setLoading(true)}>
                          {course.state === "upcoming"
                            ? t("courses.update")
                            : t("courses.viewLaunchDetails")}
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        disabled={isLocked || isWindowActif}
                        className="w-full"
                        onClick={() => { void startCourse(course); setLoading(true) }}
                      >
                        {isLocked
                          ? t("courses.restricted")
                          : isWindowActif
                            ? t("courses.roomOpen")
                            : t("courses.openRoom")}
                      </Button>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 flex h-5 w-full items-center justify-center">
          <p className="text-sm text-gray-500">
            {t("courses.noLaunched")}
          </p>
        </div>
      )}
      <ClipLoader
        color="#36d7b7"
        loading={loading}
        size={18}
        aria-label="Loading Spinner"
        data-testid="loader"
        className="absolute top-0 right-0"
      />
    </div>
  );
}
