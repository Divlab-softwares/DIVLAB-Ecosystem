"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { ClipLoader } from "react-spinners";
import PageBreadcrumb from "../common/PageBreadCrumb";
import RefreshButton from "../common/RefreshButton";
import Button from "../ui/button/Button";
import { useSearch } from "@/context/SearchContext";
import { useLocale } from "@/context/LocaleContext";
import { useCourseBroadcast } from "@/hooks/useCourseBroadcast";
import CourseCard from "@/components/courses/CourseCard";
import { filterCoursesByQuery } from "@@/lib/courseSearch";
import {
  PUBLIC_COURSES_CHANNEL,
} from "@@/lib/courseRealtimeTypes";
import {
  getUserCoursesChannel,
  type RealtimeCourse,
} from "@@/lib/courseRealtimeTypes";

type CatalogCourse = {
  id: string;
  title: string;
  description?: string | null;
  domain: string;
  frontCover: string;
  time: number;
  price: number;
  currency?: string | null;
  trainerId: string;
  trainer: {
    user: {
      id: string;
      name: string;
      // surname: string | null;
      email: string;
      image: string | null;
    };
  };
  createdAt: string | Date;
  language: string;
  state: string;
  date_start: string | Date;
  date_end: string | Date;
  roomCode?: string;
  participants?: number;
  moderatorActif?: boolean;
};

function sortCourses(courses: CatalogCourse[]) {
  return [...courses].sort((left, right) => {
    return (
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
  });
}

export default function AvailableCourses({
  courses,
}: {
  courses: CatalogCourse[];
}) {
  const { t } = useLocale();
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>(courses);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { query } = useSearch();
  const router = useRouter();

  useEffect(() => {
    setCatalogCourses(courses);
    setIsRefreshing(false);
  }, [courses]);

  useEffect(() => {
    router.refresh();
  }, [router]);

  function refreshCourses() {
    setIsRefreshing(true);
    router.refresh();
  }

  useCourseBroadcast({
    session: null,
    channelName: PUBLIC_COURSES_CHANNEL,
    isPrivate: false,
    onMessage: ({ course }) => {
      setCatalogCourses((currentCourses) => {
        const shouldStayVisible = ["started", "upcoming"].includes(course.state);
        const nextCourses = currentCourses.filter((item) => item.id !== course.id);

        if (!shouldStayVisible) {
          return sortCourses(nextCourses);
        }

        return sortCourses([...nextCourses, course as CatalogCourse]);
      });
    },
  });

  const filteredCourses = useMemo(() => {
    return filterCoursesByQuery(catalogCourses, query, (course) => [
      String(course.price ?? ""),
    ]);
  }, [catalogCourses, query]);

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

  return (
    <div>
      <PageBreadcrumb pageTitle={t("courses.availableTitle")} />
      <div className="mb-4 flex justify-end">
        <RefreshButton
          isRefreshing={isRefreshing}
          onRefresh={refreshCourses}
          label="Rafraichir"
        />
      </div>

      {catalogCourses.length === 0 && (
        <div className="flex h-64 items-center justify-center">
          <div className="dashboard-panel flex w-full items-center justify-center px-6 py-12">
            <p className="text-md font-medium text-slate-500 dark:text-slate-300">
              {t("courses.noAvailable")}
            </p>
          </div>
        </div>
      )}

      {displayedCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {displayedCourses.map((course, index) => (
              <div
                key={course.id}
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
                  trainer={{
                    id: course.trainer.user.id,
                    name: course.trainer.user.name,
                    image: course.trainer.user.image,
                  }}
                  trainerHref={{
                    pathname: "/profile",
                    query: { trainerId: course.trainer.user.id },
                  }}
                  detailsHref={{
                    pathname: "/course_details",
                    query: { courseId: course.id.toString(), DL_LV: true },
                  }}
                  onDetailsClick={() => setLoading(true)}
                  footer={
                    <div className="grid gap-3 md:grid-cols-2">
                      <Link
                        href={{
                          pathname: "/course_details",
                          query: { courseId: course.id.toString(), DL_LV: true },
                        }}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full" onClick={() => setLoading(true)}>
                          {t("courses.details")}
                        </Button>
                      </Link>
                      <Link
                        href={{
                          pathname: "/course_details",
                          hash: "purchaseForm",
                          query: { courseId: course.id.toString(), DL_LV: true },
                        }}
                        className="w-full"
                      >
                        <Button className="w-full" onClick={() => setLoading(true)}>
                          {t("courses.participate")}
                        </Button>
                      </Link>

                    </div>
                  }
                />
              </div>
            ))}
          </div>

          {visibleCount < filteredCourses.length && (
            <div ref={loaderRef} className="flex justify-center p-10">
              <Spinner size="lg" color="warning" label={t("common.loadingMore")} />
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
