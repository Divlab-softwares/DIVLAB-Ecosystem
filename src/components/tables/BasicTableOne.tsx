"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import {
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

export type AudienceCourse = {
  id: string;
  title: string;
  time: number;
  price: number;
  currency?: string;
  purchases: {
    id: number;
    paymentStatus: string;
    presence_start: string | Date;
    presence_end: string | Date;
    user: {
      name: string;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }[];
};

type Props = {
  courses: AudienceCourse[];
  selectedCourseId: string;
};

function purchaseProgress(
  presenceStart: string | Date,
  presenceEnd: string | Date,
  courseMinutes: number,
) {
  if (!courseMinutes || courseMinutes <= 0) {
    return 0;
  }
  const s = new Date(presenceStart).getTime();
  const e = new Date(presenceEnd).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) {
    return 0;
  }
  const minutes = Math.round((e - s) / 60000);
  return Math.min(100, Math.round((minutes / courseMinutes) * 100));
}

function userAvatarSrc(image: string | null | undefined) {
  return resolvePublicImage(image, "images", DEFAULT_PROFILE_IMAGE);
}

export default function BasicTableOne({ courses, selectedCourseId }: Props) {
  const rows = useMemo(() => {
    const list: {
      purchaseId: number;
      courseTitle: string;
      courseMinutes: number;
      userName: string;
      userEmail: string;
      userRole: string;
      image: string;
      paymentStatus: string;
      progress: number;
    }[] = [];

    const pushCourse = (c: AudienceCourse) => {
      for (const p of c.purchases ?? []) {
        list.push({
          purchaseId: p.id,
          courseTitle: c.title,
          courseMinutes: c.time,
          userName: p.user?.name ?? "—",
          userEmail: p.user?.email ?? "",
          userRole: p.user?.role ?? "user",
          image: userAvatarSrc(p.user?.image),
          paymentStatus: p.paymentStatus ?? "pending",
          progress: purchaseProgress(p.presence_start, p.presence_end, c.time),
        });
      }
    };

    if (selectedCourseId === "__all__") {
      for (const c of courses) {
        pushCourse(c);
      }
      return list.sort((a, b) => a.userName.localeCompare(b.userName));
    }

    const c = courses.find((x) => x.id === selectedCourseId);
    if (!c) {
      return [];
    }
    pushCourse(c);
    return list;
  }, [courses, selectedCourseId]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
        Aucun inscrit pour cette selection.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[720px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Participant
                </TableCell>
                {selectedCourseId === "__all__" && (
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    Formation
                  </TableCell>
                )}
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Paiement
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Progression
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rows.map((row) => (
                <TableRow key={`${row.purchaseId}-${row.courseTitle}`}>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={row.image}
                          alt={row.userName}
                          unoptimized={shouldBypassNextImageCache(row.image)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {row.userName}
                        </span>
                        <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                          {row.userEmail || row.userRole}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {selectedCourseId === "__all__" && (
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                      {row.courseTitle}
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        row.paymentStatus === "success"
                          ? "success"
                          : row.paymentStatus === "pending"
                            ? "warning"
                            : "error"
                      }
                    >
                      {row.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span>{row.progress}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
