"use client";

import { ChevronDownIcon } from "lucide-react";
import CourseSelect from "../form/CourseSelect";
import BasicTableOne, { type AudienceCourse } from "../tables/BasicTableOne";
import { useState, useEffect, useMemo } from "react";
import type { Session } from "next-auth";

type Props = {
  session: Session | null;
  courseId: string | undefined;
};

const ALL = "__all__";

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

const Audience = ({ session, courseId }: Props) => {
  const [courses, setCourses] = useState<AudienceCourse[]>([]);
  const [selectedId, setSelectedId] = useState<string>(courseId ?? ALL);
  const [loadError, setLoadError] = useState<string | null>(null);

  const courseOptions = useMemo(() => {
    const base = [{ id: ALL, title: "Toutes les formations" }];
    return [
      ...base,
      ...courses.map((c) => ({ id: c.id, title: c.title })),
    ];
  }, [courses]);

  useEffect(() => {
    if (courseId) {
      setSelectedId(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    async function getOnlineFormations() {
      if (!session?.user?.id) {
        return;
      }
      try {
        const res = await fetch(
          `/api/formation?trainerId=${encodeURIComponent(session.user.id)}`,
        );
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("Données invalides");
        }
        setCourses(data.data as AudienceCourse[]);
        setLoadError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        console.error("Erreur lors de la récupération des formations :", err);
        setLoadError(message);
      }
    }

    void getOnlineFormations();
  }, [session?.user?.id]);

  const stats = useMemo(() => {
    const selected =
      selectedId === ALL
        ? null
        : courses.find((c) => c.id === selectedId) ?? null;

    const purchases =
      selectedId === ALL
        ? courses.flatMap((c) =>
            (c.purchases ?? []).map((p) => ({ purchase: p, course: c })),
          )
        : (selected?.purchases ?? []).map((p) => ({
            purchase: p,
            course: selected!,
          }));

    const enrolled = purchases.length;
    if (enrolled === 0) {
      return { enrolled: 0, avgProgress: null as number | null };
    }
    const progresses = purchases.map(({ purchase, course }) =>
      purchaseProgress(
        purchase.presence_start,
        purchase.presence_end,
        course.time,
      ),
    );
    const avgProgress = Math.round(
      progresses.reduce((a, b) => a + b, 0) / progresses.length,
    );
    return { enrolled, avgProgress };
  }, [courses, selectedId]);

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Connectez-vous en tant que formateur pour consulter votre audience.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Participants aux formations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Filtrez par formation ou consultez l&apos;ensemble des inscrits.
        </p>
        {loadError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {loadError}
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Inscrits (sélection)
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.enrolled}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Progression moyenne
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.avgProgress === null ? "—" : `${stats.avgProgress}%`}
            </p>
            <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
              Estimée à partir des logs de présence et de la durée prévue de la formation.
            </p>
          </div>
        </div>
        <div className="relative mt-4">
          <CourseSelect
            key={courseOptions.map((o) => o.id).join("-")}
            options={courseOptions}
            defaultValue={selectedId}
            placeholder="Vos formations"
            onChange={(v) => setSelectedId(v)}
            className="dark:bg-dark-900"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      <div className="space-y-6 border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <BasicTableOne courses={courses} selectedCourseId={selectedId} />
      </div>
    </div>
  );
};

export default Audience;
