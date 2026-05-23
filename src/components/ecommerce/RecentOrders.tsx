"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import Badge from "../ui/badge/Badge";
import { useState } from "react";
import {
  DEFAULT_FRONT_COVER,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";
import { ClipLoader } from "react-spinners";

type Courses = {
  id: string;
  title: string;
  domain: string;
  state: string;
  date_start: Date;
  price: number;
  currency: string;
  frontCover?: string | null;
  participants?: number;
  _count?: {
    purchases?: number;
  };
};

type Props = {
  trainerFormation: Courses[];
};

function getStatusColor(state: string) {
  if (state === "started") return "success";
  if (state === "upcoming") return "warning";
  return "error";
}

export default function RecentOrders({ trainerFormation }: Props) {
  const { t } = useLocale();
const [loading, setLoading] = useState(false);
  return (
    <div className="dashboard-panel overflow-hidden px-4 pb-4 pt-4 sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("stats.recentCourses")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {t("stats.recentCoursesText")}
          </p>
        </div>

        <Link
          href="/courses_state"
          onClick={()=>setLoading(true)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-theme-xs transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {t("stats.seeAll")}
        </Link>
      </div>

      <div className="grid gap-3">
        {trainerFormation.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
            {t("stats.noData")}
          </div>
        ) : (
          trainerFormation.slice(0, 5).map((course) => (
            (() => {
              const imageSrc = resolvePublicImage(
                course.frontCover,
                "images",
                DEFAULT_FRONT_COVER,
              );

              return (
            <div
              key={course.id}
              className="dashboard-subpanel flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl">
                  <Image
                    width={56}
                    height={56}
                    src={imageSrc}
                    unoptimized={shouldBypassNextImageCache(imageSrc)}
                    className="h-full w-full object-cover"
                    alt={course.title}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {course.title}
                  </p>
                  <span className="text-sm text-slate-500 dark:text-slate-300">
                    {course.domain}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3 xl:min-w-[420px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    {t("stats.learners")}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {course.participants ?? course._count?.purchases ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    {t("stats.lastSession")}
                  </p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(course.date_start))}
                  </p>
                </div>
                <div className="flex items-center sm:justify-end">
                  <Badge color={getStatusColor(course.state) as "success" | "warning" | "error"}>
                    {course.state}
                  </Badge>
                </div>
              </div>
            </div>
              );
            })()
          ))
        )}
      </div>
      <ClipLoader
        color="#2563eb"
        loading={loading}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
        className="mx-auto mt-4 absolute bottom-2 right-2"
      />
    </div>
  );
}
