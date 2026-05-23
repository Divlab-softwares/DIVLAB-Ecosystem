"use client";
import React from "react";
import { BookOpenCheck, CalendarClock, GraduationCap, Users } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="dashboard-panel dashboard-grid-background p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
          <h4 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
            {value}
          </h4>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950">
          {icon}
        </div>
      </div>
    </div>
  );
}

export const EcommerceMetrics = ({
  totalFormations,
  totalPurchases,
  activeCourses,
  upcomingCourses,
}: {
  totalFormations: number;
  totalPurchases: number;
  activeCourses: number;
  upcomingCourses: number;
}) => {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<Users className="h-5 w-5" />}
        label={t("stats.participants")}
        value={totalPurchases}
      />
      <MetricCard
        icon={<GraduationCap className="h-5 w-5" />}
        label={t("stats.formations")}
        value={totalFormations}
      />
      <MetricCard
        icon={<BookOpenCheck className="h-5 w-5" />}
        label={t("stats.activeCourses")}
        value={activeCourses}
      />
      <MetricCard
        icon={<CalendarClock className="h-5 w-5" />}
        label={t("stats.upcomingCourses")}
        value={upcomingCourses}
      />
    </div>
  );
};
