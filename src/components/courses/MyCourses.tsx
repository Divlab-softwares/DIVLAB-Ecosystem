"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { ClipLoader } from "react-spinners";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import RefreshButton from "../common/RefreshButton";
import Button from "../ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { useSearch } from "@/context/SearchContext";
import { useLocale } from "@/context/LocaleContext";
import { useCourseBroadcast } from "@/hooks/useCourseBroadcast";
import CourseCard from "@/components/courses/CourseCard";
import { filterCoursesByQuery } from "@@/lib/courseSearch";
import { generateRoom } from "@@/lib/generateRoom";
import { formatSlotRangeFr, getEffectiveCourseSlots } from "@@/lib/courseDateUtils";
import {
  getUserCoursesChannel,
  type RealtimeCourse,
} from "@@/lib/courseRealtimeTypes";

type Purchase = {
  id: string;
  formationId: string;
  formation: RealtimeCourse;
  accessToken: string;
  paymentStatus: string;
  userId: string;
  createdAt: string;
};

type Props = {
  session: Session | null;
  myCourses: RealtimeCourse[];
  myPurchases: Purchase[];
};

type CourseAccessState =
  | { type: "open"; badge: null }
  | { type: "completed"; badge: string }
  | { type: "between"; badge: string; nextSessionDate: Date }
  | { type: "upcoming"; badge: string; nextSessionDate: Date };

function getOrdinalLabel(index: number) {
  return index === 0 ? "1re" : `${index + 1}e`;
}

function getSessionAccessState(course: RealtimeCourse): CourseAccessState {
  const slots = getEffectiveCourseSlots(course.slots, course.date_start, course.date_end);

  if (slots.length === 0) {
    return { type: "open", badge: null };
  }

  const now = Date.now();
  const lastSlot = slots[slots.length - 1];

  if (now > lastSlot.endsAt.getTime()) {
    return {
      type: "completed",
      badge: "Formation terminée",
    };
  }

  const activeSlot = slots.find(
    (slot) => now >= slot.startsAt.getTime() && now <= slot.endsAt.getTime(),
  );

  if (activeSlot) {
    return { type: "open", badge: null };
  }

  const previousIndex = slots.findLastIndex((slot) => now > slot.endsAt.getTime());
  const nextSlot = slots.find((slot) => now < slot.startsAt.getTime());

  if (previousIndex >= 0 && nextSlot) {
    return {
      type: "between",
      badge: `${getOrdinalLabel(previousIndex)} session terminée, prochaine ${formatSlotRangeFr(nextSlot.startsAt, nextSlot.endsAt).toLowerCase()}`,
      nextSessionDate: nextSlot.startsAt,
    };
  }

  if (nextSlot) {
    return {
      type: "upcoming",
      badge: `Prochaine session ${formatSlotRangeFr(nextSlot.startsAt, nextSlot.endsAt).toLowerCase()}`,
      nextSessionDate: nextSlot.startsAt,
    };
  }

  return { type: "open", badge: null };
}

export default function MyCourses({
  session,
  myCourses,
  myPurchases,
}: Props) {
  const { t } = useLocale();
  const [courses, setCourses] = useState<RealtimeCourse[]>(myCourses);
  const [initRoomDate, setInitRoomDate] = useState<Date | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>(myPurchases);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWindowActive, setIsWindowActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { query } = useSearch();
  const router = useRouter();

  useEffect(() => {
    setCourses(myCourses);
    setIsRefreshing(false);
  }, [myCourses]);

  useEffect(() => {
    setPurchases(myPurchases);
  }, [myPurchases]);

  useEffect(() => {
    router.refresh();
  }, [router]);

  function refreshCourses() {
    setIsRefreshing(true);
    router.refresh();
  }

  useCourseBroadcast({
    session,
    channelName: session?.user?.id ? getUserCoursesChannel(session.user.id) : null,
    onMessage: ({ course }) => {
      setCourses((currentCourses) =>
        currentCourses.map((item) =>
          item.id === course.id ? { ...item, ...course } : item,
        ),
      );
    },
  });

  const filteredCourses = useMemo(() => {
    return filterCoursesByQuery(courses, query, (course) => [
      String(course.price ?? ""),
      String(course.participants ?? ""),
    ]);
  }, [courses, query]);

  const displayedCourses = filteredCourses.slice(0, visibleCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredCourses.length) {
          setVisibleCount((previousCount) => previousCount + 10);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [filteredCourses.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(10);
  }, [query]);

  // 1. Déclare une ref pour stocker la fenêtre, la fonction et l'intervalle
  const windowRef = useRef<Window | null>(null);
  const [activeCourse, setActiveCourse] = useState<RealtimeCourse | null>(null);

  async function startCourse(course: RealtimeCourse, currentPurchase: Purchase) {
    if (currentPurchase.formationId !== course.id) {
      alert(t("courses.joinErrorUnauthorized"));
      setLoading(false);
      return;
    }

    if (currentPurchase.paymentStatus !== "success") {
      alert(t("courses.joinErrorPayment"));
      setLoading(false);
      return;
    }

    if (!currentPurchase.accessToken) {
      alert(t("courses.joinErrorToken"));
      setLoading(false);
      return;
    }
    setInitRoomDate(new Date(Date.now()))
    setActiveCourse(course);
    console.log("Date actuelle ", Date.now())


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

    const meetingWindow = window.open(
      `https://meet.jit.si/${roomCode}#${options}`,
      "_blank",
    );
    if (meetingWindow) {
      windowRef.current = meetingWindow;
      setInitRoomDate(new Date()); // On marque le début
      setIsWindowActive(true);

      const response = await fetch("/api/logs/course-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          userId: session?.user?.id,
          token: currentPurchase.accessToken,
          role: session?.user?.role || "participant",
          action: "join",
        }),
      });

      if (!response.ok) {
        alert(t("courses.joinErrorLog"));
        setLoading(false);
        return;
      }

      setLoading(false);
    }
  }


  // 2. Utilise un useEffect pour surveiller la fenêtre proprement
  useEffect(() => {
    if (!isWindowActive || !initRoomDate || !windowRef.current || !activeCourse) return;

    const checkWindow = setInterval(() => {
      const win = windowRef.current;

      // Cas 1 : L'utilisateur ferme la fenêtre manuellement
      if (win?.closed) {
        stopMonitoring();
        return;
      }

      // Cas 2 : Le temps est écoulé
      const now = new Date().getTime();
      const startTime = initRoomDate.getTime();
      const diffInMinutes = Math.floor((now - startTime) / (1000 * 60));

      if (diffInMinutes >= activeCourse.time) {
        console.log("Temps écoulé, fermeture de la surveillance...");
        win?.close(); // Optionnel : force la fermeture de l'onglet Meet
        stopMonitoring();
      }
    }, 3000); // 3 secondes suffisent pour économiser les ressources

    const stopMonitoring = () => {
      clearInterval(checkWindow);
      setIsWindowActive(false);
      setActiveCourse(null); // On réinitialise pour la prochaine fois
      windowRef.current = null;
    };

    return () => clearInterval(checkWindow); // Nettoyage si le composant change
  }, [isWindowActive, initRoomDate, activeCourse]);


  return (
    <div>
      <PageBreadcrumb pageTitle={t("courses.myTitle")} />
      <div className="mb-4 flex justify-end">
        <RefreshButton
          isRefreshing={isRefreshing}
          onRefresh={refreshCourses}
          label="Rafraichir"
        />
      </div>

      {courses.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <div className="dashboard-panel mb-6 mt-6 flex w-full items-start justify-center px-6 py-12">
            <p className="text-sm font-bold italic text-slate-500 dark:text-slate-300">
              {t("courses.noOwned")}
            </p>
          </div>
        </div>
      )}

      {session ? (
        displayedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {displayedCourses.map((course, index) => {
                const userPurchase = purchases.find(
                  (item) => item.formationId === course.id,
                );
                const isLocked = !userPurchase || course.state !== "started";
                const sessionAccess = getSessionAccessState(course);
                const isSessionLocked = sessionAccess.type !== "open";
                const disabledReason =
                  sessionAccess.type === "completed"
                    ? "Formation terminée"
                    : sessionAccess.type === "between"
                      ? "Prochaine session à venir"
                      : sessionAccess.type === "upcoming"
                        ? "Session à venir"
                        : null;

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
                      // sessionAccess={sessionAccess}
                      currency={course.currency}
                      language={course.language}
                      state={course.state}
                      dateStart={course.date_start}
                      dateEnd={course.date_end}
                      participants={course.participants}
                      accessKey={userPurchase?.accessToken || t("common.notAvailable")}
                      trainer={{
                        id: course.trainer.user.id,
                        name: course.trainer?.user.name || t("common.unknown"),
                        image: course.trainer.user.image,
                      }}
                      trainerHref={{
                        pathname: "/profile",
                        query: { trainerId: course.trainer.user.id },
                      }}
                      detailsHref={{
                        pathname: "/course_details",
                        query: { courseId: course.id },
                      }}
                      onDetailsClick={() => setLoading(true)}
                      footer={
                        <div>
                          {sessionAccess.badge && (
                            <div className="mb-3">
                              <Badge color={sessionAccess.type === "completed" ? "dark" : "info"}>
                                {sessionAccess.type === "completed" ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <CalendarClock className="h-4 w-4" />
                                )}
                                {sessionAccess.badge}
                              </Badge>
                            </div>
                          )}
                          <div className="relative grid gap-3 md:grid-cols-2">
                            <Link
                              href={{
                                pathname: "/course_details",
                                query: { courseId: course.id },
                              }}
                              className="w-full"
                            >
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setLoading(true)}
                              >
                                {t("courses.details")}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              disabled={isLocked || isSessionLocked || !course.moderatorActif || isWindowActive}
                              className="w-full transition-transform duration-300 hover:scale-[1.01]"
                              onClick={() => {
                                setLoading(true);
                                void startCourse(course, userPurchase!);
                              }}
                            >
                              {isLocked
                                ? t("courses.restricted")
                                : disabledReason
                                  ? disabledReason
                                : !course.moderatorActif
                                  ? t("courses.waitTrainerOnButton")
                                  : isWindowActive
                                    ? t("courses.roomOpen")
                                    : t("courses.openRoom")}
                              <ClipLoader
                                color="#36d7b7"
                                loading={!course.moderatorActif && !isLocked}
                                size={18}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                                className="absolute top-0 right-0"
                              />
                            </Button>
                          </div>
                          {!course.moderatorActif && !isLocked && <p className="text-center dark:text-gray-400 text-gray-600">{t("courses.waitTrainer")}</p>}
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredCourses.length && (
              <div ref={loaderRef} className="flex justify-center p-10">
                <Spinner
                  size="lg"
                  color="warning"
                  label={t("common.loadingMore")}
                />
              </div>
            )}
          </>
        ) : (
          query && (
            <div className="mt-6 flex w-full items-center justify-center">
              <p className="text-sm text-gray-500">
                {t("common.noResults", { query })}
              </p>
            </div>
          )
        )
      ) : (
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-gray-600">
            {t("courses.signInRequired")}
          </p>
          <p className="text-sm text-gray-400">
            <Link href="/signin" className="cursor-pointer text-blue-700 underline">
              {t("courses.signInCta")}
            </Link>{" "}
            {t("common.or")}{" "}
            <Link href="/signup" className="cursor-pointer text-blue-700 underline">
              {t("courses.signUpCta")}
            </Link>
          </p>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-9999 mt-5 flex flex-col items-center justify-center">
        <ClipLoader
          color="#36d7b7"
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    </div>
  );
}
