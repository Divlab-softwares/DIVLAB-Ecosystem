
import { prisma } from "@@/lib/prisma";
import { User } from "@@/lib/getUserInfoLib";
import { unstable_cache } from "next/cache";
import {
    DEFAULT_BACK_COVER,
    DEFAULT_FRONT_COVER,
    DEFAULT_PROFILE_IMAGE,
    resolvePublicImage,
} from "./imageSources";


type Courses = {
    id: string,
    title: string,
    description: string,
    domain: string,
    state: string,
    roomCode: string,
    date_start: Date,
    date_end: Date,
    time: number,       // Image représentative
    price: number,  // Lien public du fichier
    trainerId: string,
    trainer: { user: User, valid: boolean, reject: boolean },  // formateur
    createdAt: Date,
    updatedAt: Date,
    language: string,
    currency: string,
    frontCover: string,
    backCover: string,
    slots?: { id: string; startsAt: Date; endsAt: Date; sortOrder: number }[],
};

export async function getCourseById(id: string | undefined) {


    if (!id) return null;

    let formations: any = null;
    try {
        formations = await prisma.course.findUnique({
            where: { id: id },
            select: {
                id: true,
                title: true,
                description: true,
                domain: true,
                date_start: true,
                date_end: true,
                roomCode: true,
                backCover: true,
                language: true,
                currency: true,
                state: true,
                frontCover: true,
                trainer: {
                    select: { user: { select: { id: true, name: true, email: true, image: true } } }
                },  // formateur
                time: true,
                price: true,  // Lien public du fichier
                trainerId: true,       // Image représentative
                createdAt: true,
                updatedAt: true,
                slots: {
                    orderBy: { sortOrder: "asc" },
                    select: { id: true, startsAt: true, endsAt: true, sortOrder: true },
                },
            },
        });
    } catch (error) {
        console.error(
            "[getCourseById] Requête avec slots impossible (migration CourseSlot absente ?), fallback.",
            error,
        );
        formations = await prisma.course.findUnique({
            where: { id: id },
            select: {
                id: true,
                title: true,
                description: true,
                domain: true,
                date_start: true,
                date_end: true,
                roomCode: true,
                backCover: true,
                language: true,
                currency: true,
                state: true,
                frontCover: true,
                trainer: {
                    select: { user: { select: { id: true, name: true, email: true, image: true } } }
                },  // formateur
                time: true,
                price: true,  // Lien public du fichier
                trainerId: true,       // Image représentative
                createdAt: true,
                updatedAt: true,
            },
        });
        if (formations) {
            formations = { ...formations, slots: [] };
        }
    }

    if (formations) {
        const withPublicImg = {
            ...(formations),
            trainer: { ...formations.trainer, user: { ...formations.trainer.user, image: resolvePublicImage(formations.trainer.user.image, "images", DEFAULT_PROFILE_IMAGE) } },
            frontCover: resolvePublicImage(formations.frontCover, "images", DEFAULT_FRONT_COVER),
            backCover: resolvePublicImage(formations.backCover, "images", DEFAULT_BACK_COVER),
        };

        console.log("CourseID sever", id)
        return withPublicImg as Courses;
    }

    console.log("CourseID sever", id)
    return null;

}

export async function getPurchasedCourses(userId: string) {
    try {
        const purchases = await prisma.purchase.findMany({
            where: { userId, paymentStatus: "success" },
            orderBy: { createdAt: "asc" },
            select: {
                // id: true,
                formationId: true,
                accessToken: true,
                paymentStatus: true,
                userId: true,
                createdAt: true,
            },
        });
        const purchasedCopy: string[] = []

        purchases.forEach((purchase: { formationId: string; }) => {
            purchasedCopy.push(purchase.formationId);

            // console.log("Valeurs:", purchasedCopy);
        });
        // console.log("Valeurs finales:", purchasedCopy.includes(courseId), courseId, purchasedCopy);
        // setPurchased(purchasedCopy)

        return purchasedCopy;

    } catch (err: string | any) {
        console.error("Erreur lors de la récupération des formations en ligne :", err.message);
        return [];
    }
}

export const getRankedCourses = unstable_cache(
    async () => {
        console.log("=== RÉCUPÉRATION DB : Ranked Courses ===");
        try {
            const formations = await prisma.course.findMany({
                where: { state: { in: ["started", "upcoming"] }, rank: { gt: 0 } },
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    frontCover: true,
                    backCover: true,
                    domain: true,
                    // state: true,
                    // date_start: true,
                    // date_end: true,
                    // language: true,
                    // time: true,       // Image représentative
                    price: true,  // Lien public du fichier
                    // trainerId: true,
                    // trainer: {
                    //     select: { user: { select: { id: true, name: true, email: true } }, valid: true, reject: true }
                    // },  // formateur
                    // createdAt: true,
                },
            });

            const withPublicImg: Courses[] = (formations || []).map((course: any) => ({
                ...(course),
                // trainer: { ...formations.trainer, user: { ...formations.trainer.user, image: (getSupabasePublicLink(formations.trainer.user.image as string, "images") ?? (formations.trainer.user.image as string)) as string } },
                frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
                backCover: resolvePublicImage(course.backCover, "images", DEFAULT_BACK_COVER),
            }));
            // console.log("Ranked courses:", withPublicImg);

            return withPublicImg as Courses[];

        } catch (err: any) {
            console.error("Erreur de recuperation des formations classées:", err.message);
            return [];
        }
    },
    ['ranked-courses-key'], // Clé unique pour identifier ce cache
    {
        revalidate: 3600, // Cache pendant 1 heure (en secondes)
        tags: ['rankedCourses'] // Tag pour pouvoir forcer la mise à jour plus tard
    }
);

export const getTrainerAnalytics = (trainerId: string) =>
    unstable_cache(
        async () => {
            console.log(`=== RÉCUPÉRATION DB : Analytics pour ${trainerId} ===`);

            const realTrainerId = await prisma.trainer.findUnique({
                where: { userId: trainerId },
                select: { id: true },
            });

            if (!realTrainerId) {
                console.error("Ce formateur n'existe pas.");
                return {
                    totalFormations: 0,
                    totalPurchases: 0,
                    participantsByMonth: [],
                    revenueByMonth: [],
                    locations: [],
                    formationsByMonth: [],
                    trainerCourses: [],
                };
            }

            try {
                // 1️⃣ Nombre de formations
                const totalFormations = await prisma.course.count({
                    where: { trainerId: realTrainerId.id },
                });

                // 2️⃣ Nombre total d'achats (validés)
                const totalPurchases = await prisma.purchase.count({
                    where: {
                        course: { trainerId: realTrainerId.id },
                        paymentStatus: "success",
                    },
                });

                // 3️⃣ Toutes les purchases utiles
                const purchases = await prisma.purchase.findMany({
                    where: {
                        course: { trainerId: realTrainerId.id },
                        paymentStatus: "success",
                    },
                    include: {
                        course: true,
                        user: true,
                    },
                });

                //Toutes les formations du formateur (pour les dates de création)
                const formations = await prisma.course.findMany({
                    where: { trainerId: realTrainerId.id },
                    select: {
                        createdAt: true,
                    },
                });



                // 📊 Structures
                const participantsByMonth: Record<string, number> = {};
                const revenueByMonth: Record<string, number> = {};
                const locationStats: Record<string, number> = {};
                const formationsByMonth: Record<string, number> = {};

                formations.forEach((f) => {
                    const month = new Date(f.createdAt).toISOString().slice(0, 7);

                    formationsByMonth[month] =
                        (formationsByMonth[month] || 0) + 1;
                });

                let totalParticipants = 0;

                purchases.forEach((p) => {
                    const month = new Date(p.createdAt).toISOString().slice(0, 7);

                    // participants
                    participantsByMonth[month] =
                        (participantsByMonth[month] || 0) + 1;

                    // revenus
                    revenueByMonth[month] =
                        (revenueByMonth[month] || 0) + p.course.price;

                    // localisation
                    const loc = p.user.country || "Unknown";
                    locationStats[loc] = (locationStats[loc] || 0) + 1;

                    totalParticipants++;
                });

                // 🔁 Transformation

                const formationsByMonthResult = Object.entries(formationsByMonth)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, count]) => ({
                        month,
                        formations: count,
                    }));

                const participantsResult = Object.entries(participantsByMonth)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, count]) => ({
                        month,
                        participants: count,
                    }));

                const revenueResult = Object.entries(revenueByMonth)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, revenue]) => ({
                        month,
                        revenue,
                    }));

                const locationResult = Object.entries(locationStats).map(
                    ([location, count]) => ({
                        location,
                        count,
                        percentage: (count / totalParticipants) * 100,
                    })
                );

                const trainerCourses = await prisma.course.findMany({
                    where: { trainerId: realTrainerId?.id },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        domain: true,
                        date_start: true,
                        date_end: true,
                        roomCode: true,
                        frontCover: true,
                        currency: true,
                        state: true,
                        language: true,
                        trainer: {
                            select: { user: { select: { id: true, name: true, email: true, image: true, socialMedias: true, trainer: true } }, valid: true, reject: true }
                        },   // formateur
                        time: true,       // Image représentative
                        price: true,  // Lien public du fichier
                        trainerId: true,       // Image représentative
                        createdAt: true,
                        _count: {
                            select: {
                                purchases: true
                            },
                        },
                        backCover: true,
                        updatedAt: true,
                        purchases: { select: { id: true, userId: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
                    },
                });

                const normalizedTrainerCourses = trainerCourses.map((course) => ({
                    ...course,
                    frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
                    backCover: resolvePublicImage(course.backCover, "images", DEFAULT_BACK_COVER),
                    trainer: {
                        ...course.trainer,
                        user: {
                            ...course.trainer.user,
                            image: resolvePublicImage(course.trainer.user.image, "images", DEFAULT_PROFILE_IMAGE),
                        },
                    },
                    participants: course._count?.purchases ?? 0,
                }));

                return {
                    totalFormations,
                    totalPurchases,
                    participantsByMonth: participantsResult,
                    revenueByMonth: revenueResult,
                    locations: locationResult,
                    formationsByMonth: formationsByMonthResult,
                    trainerCourses: normalizedTrainerCourses as unknown as Courses[],
                };
            } catch (error: any) {
                console.error("Erreur de recuperation des formations classées:", error.message);
                return { totalFormations: 0, totalPurchases: 0, participantsByMonth: [], revenueByMonth: [], locations: [], formationsByMonth: [], trainerCourses: []};
            }
        },
        [`trainer-stats-${trainerId}`], // Clé incluant l'ID pour ne pas mélanger les profils
        { revalidate: 600, tags: [`stats-${trainerId}`] } // Cache 10 minutes
    )(); // On l'appelle immédiatement car c'est une fonction qui prend un argument
