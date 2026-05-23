
import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React, { useEffect, useState } from "react";
import AvailableCourses from "@/components/courses/AvailableCourses";
import { User } from "@@/lib/getUserInfoLib";
import getSupabasePublicLink from "@@/lib/getSupabasePublicLink";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";
// import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GridIcon, GroupIcon } from "lucide-react";
// import Badge from "@/components/ui/badge/Badge";


type Courses = {
    id: number,
    title: string,
    description: string,
    domain: string,
    frontCover: string;
    time: string,       // Image représentative
    price: number,  // Lien public du fichier
    trainerId: number,
    trainer: { user: User },  // formateur
    createdAt: Date,
    language: string,
    state: string,
    date_start: string,
    date_end: string,
    updatedAt: Date,
};

export async function getCourseWithSupabaseImg() {
    try {
        const res = await fetch("/api/formation");
        //     , {
        //     cache: 'no-store' // 2. Force le chargement pour voir le loading.tsx
        // });

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const data = await res.json();

        if (data.success && data.data) {
            const withPublicImg: Courses[] = (data.data || []).map((course: any) => ({
                ...(course as Courses[]),
                frontCover: (getSupabasePublicLink(course.frontCover as string, "images") ?? (course.frontCover as string)) as string,
                backCover: (getSupabasePublicLink(course.bacckCover as string, "images") ?? (course.backCover as string)) as string,
            }));

            return withPublicImg as Courses[];
        }
        return []; // Retourne un tableau vide au lieu de undefined
    } catch (err: any) {
        console.error("Erreur :", err.message);
        return []; // Évite que 'courses' soit undefined
    }
}