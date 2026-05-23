import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NewCourseForm from "@/components/courses/NewCourseForm";
import { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption"

export const metadata: Metadata = {
  title: "Lancer une formation | DIVLAB Train",
  description:
    "Creez ou mettez a jour une formation sur DIVLAB Train avec une configuration claire des dates, du contenu et du tarif.",
};

export default async function LaunchCourses({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await getServerSession(authOptions);

  const query = await searchParams;
  const courseId = query.courseId;
  const prefillCalendarDate = query.prefillDate ?? query.date;

  return (
    <div>
      <PageBreadcrumb pageTitle="Lancer une formation" />
      <div className="dashboard-panel dashboard-grid-background min-h-screen px-5 py-7 xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[760px] text-center">
          <span className="dashboard-stat-chip">
            {courseId ? "Mode edition" : "Nouvelle publication"}
          </span>
          <h3 className="mb-4 mt-4 text-theme-xl font-semibold text-slate-900 dark:text-white/90 sm:text-2xl">
            {courseId ? "Mettre a jour la formation" : "Nouvelle formation"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-300 sm:text-base">
            Structurez votre session, definissez les creneaux utiles et gardez un parcours de creation clair pour vos PARTICIPANTS.
          </p>
        </div>
        <NewCourseForm
          session={session}
          cId={courseId}
          prefillCalendarDate={prefillCalendarDate}
        />
      </div>
    </div>
  );
}
