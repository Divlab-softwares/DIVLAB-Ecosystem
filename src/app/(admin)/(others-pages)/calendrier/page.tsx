import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Calendrier | DIVLAB Training",
  description: "Vos formations sur le calendrier (mois, semaine, jour).",
};

export default function CalendrierPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendrier" />
      <Calendar />
    </div>
  );
}
