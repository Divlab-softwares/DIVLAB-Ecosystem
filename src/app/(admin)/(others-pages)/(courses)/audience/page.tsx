import Audience from "@/components/audience/Audience";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption"

export const metadata: Metadata = {
    title: "DIVLAB | DIVLAB - Train",
    description:
        "This is DIVLAB  page for DIVLAB  Tailwind CSS Admin Dashboard Template",
    // other metadata
};

export default async function MyAudience({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const session = await getServerSession(authOptions);

    const query = await searchParams;
    const courseId = query.courseId;

    if (session?.user?.role !== "trainer") {
        return (
            <div>
                <PageBreadcrumb pageTitle="Votre audience" />
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Cette page est réservée aux formateurs.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Votre audience" />

            <div className="space-y-6">
                <Audience session={session} courseId={courseId} />
            </div>
        </div>
    );
}
