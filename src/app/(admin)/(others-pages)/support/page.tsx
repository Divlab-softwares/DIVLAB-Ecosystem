
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Footer1 from "@/components/footer/Footer1";
import ContactForm from "@/components/form/ContactForm";
import UserInfo from "@/components/user-profile/UserInfo";
// import UserMetaCard from "@/components/user-profile/UserMetaCard";
// import UserTrainerInfo from "@/components/user-profile/UserTrainerInfo";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Support DIVLAB",
    description:
        "Page de support pour les utilisateurs de DIVLAB Train. Contactez-nous pour toute question ou assistance concernant nos formations en ligne, la vision et les mini formations.",
};



export default async function Support({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>
}) {
    const query = await searchParams;
    const trainerId = query.trainerId ? query.trainerId : null;

    console.log("trainerId:", trainerId);
    return (
        <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
            <PageBreadcrumb pageTitle= "Support DIVLAB" />
                {/* // <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7 border-b">
                //     Support DIVLAB
                // </h3> */}
                <ContactForm />
                {/* {trainerId ? <UserInfo trainerId={trainerId} /> : <UserInfo />} */}

            </div>

            <Footer1 className="rounded-2xl border border-gray-200 bg-white text-gray-800 dark:text-gray-100 p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"/>
        </div>
    );
}
