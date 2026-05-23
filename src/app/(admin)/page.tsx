import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption"
import Button from "@/components/ui/button/Button";
import Home from "@/components/courses/Home";
import { getRankedCourses, getTrainerAnalytics } from "@@/lib/db-queries";

export const metadata: Metadata = {
  title:
    "Acceuil ",
  description: "Votre page d'acceuil pour suivre vos formations en ligne et votre progression sur DIVLAB Train",
};


export default async function Ecommerce() {
  const session = await getServerSession(authOptions);

  const [rankedData, trainerData] = await Promise.all([
    getRankedCourses(),
    session?.user?.role === "trainer" ? getTrainerAnalytics(session.user.id) : null
  ]);
  
  return (
    <div>
      <Home session={session} initialRankedCourses={rankedData} initialTrainerFormation={trainerData} />
    </div>
  );
}
