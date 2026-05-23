
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserInfo from "@/components/user-profile/UserInfo";
// import UserMetaCard from "@/components/user-profile/UserMetaCard";
// import UserTrainerInfo from "@/components/user-profile/UserTrainerInfo";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Profil",
  description:
    "Page de profil pour les utilisateurs de DIVLAB Train. Consultez et modifiez vos informations personnelles, adresse et autres détails liés à votre compte. Les formateurs peuvent également voir des informations spécifiques à leur rôle.",
};



export default async function Profile({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const query = await searchParams;
  const trainerId = query.trainerId ? query.trainerId : null;

  console.log("trainerId:", trainerId);
  return (
    <div>
      <div className="rounded-[28px] border border-white/70 bg-white/88 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-slate-950/72 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(15,118,110,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.94))] p-5 lg:p-6">
        <PageBreadcrumb pageTitle={trainerId ? "Profil du Formateur" : "Votre profil"} />
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {trainerId ? "Profil du Formateur" : "Votre profil"}
        </h3> */}
        {trainerId ? <UserInfo trainerId={trainerId} /> : <UserInfo />}

      </div>
    </div>
  );
}
