import { NextResponse } from "next/server";
import { prisma } from "@@/lib/prisma";

/**
 * ✅ Récupère toutes les formations avec Prisma
 * - Trie par date de création décroissante
 * - Inclut les informations de base : titre, description, image, etc.
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const courseId = searchParams.get("courseId");
        const trainerId = searchParams.get("trainerId");
        const rankedCourses = searchParams.get("rankedCourses") === "true";
        // let formations;

        if (userId) {
            const purchases = await prisma.purchase.findMany({
                where: { userId },
                orderBy: { createdAt: "asc" },
                select: {
                    // id: true,
                    formationId: true,
                    // formation: {
                    //     select: {
                    //         id: true,
                    //         title: true,
                    //         description: true,
                    //         domain: true,
                    //         date_start: true,
                    //         date_end: true,
                    //         roomCode: true,
                    //         currency: true,
                    //         state: true,
                    //         language: true,
                    //         trainer: {
                    //             select: { user: { select: {id:true,  name: true, email: true } }, valid: true, reject:true}
                    //         },   // formateur
                    //         time: true,       // Image représentative
                    //         price: true,  // Lien public du fichier
                    //         trainerId: true,       // Image représentative
                    //         createdAt: true,
                    //     }
                    // },
                    accessToken: true,
                    paymentStatus: true,
                    userId: true,
                    createdAt: true,
                },
            });

            const formations = await prisma.course.findMany({
                where: {
                    purchases: {
                        some: {
                            userId
                            // , paymentStatus: "success"
                        }
                    }
                },
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    domain: true,
                    date_start: true,
                    date_end: true,
                    frontCover: true,
                    roomCode: true,
                    currency: true,
                    state: true,
                    language: true,
                    trainer: {
                        select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
                    },   // formateur
                    time: true,       // Image représentative
                    price: true,  // Lien public du fichier
                    trainerId: true,       // Image représentative
                    createdAt: true,
                    slots: {
                        orderBy: { sortOrder: "asc" },
                        select: { id: true, startsAt: true, endsAt: true, sortOrder: true },
                    },
                    _count: {
                        select: {
                            purchases: true
                            // {
                            //     where: {
                            //         paymentStatus: "success",
                            //     },
                            // },
                        },
                    },
                    // purchases: { select: { id: true, userId: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
                },
            });

            const counts = await prisma.purchase.groupBy({
                by: ["formationId"],
                // where: {
                //     paymentStatus: "success",
                // },
                _count: {
                    formationId: true,
                },
            });

            const result = formations.map(f => {
                const count = counts.find(c => c.formationId === f.id);

                return {
                    ...f,
                    participants: count?._count.formationId || 0,
                };
            });

            return NextResponse.json({
                success: true, purchase: purchases, data: result
            }, { status: 200 });

        } else if (trainerId) {

            const realTrainerId = await prisma.trainer.findUnique({
                where: { userId: trainerId },
                select: { id: true },
            });

            if (!realTrainerId) {
                return NextResponse.json({
                    success: false, error: "Ce formateur n'existe pas."
                }, { status: 400 });
            }

            const formations = await prisma.course.findMany({
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
                        select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
                    },   // formateur
                    time: true,       // Image représentative
                    price: true,  // Lien public du fichier
                    trainerId: true,       // Image représentative
                    createdAt: true,
                    slots: {
                        orderBy: { sortOrder: "asc" },
                        select: { id: true, startsAt: true, endsAt: true, sortOrder: true },
                    },
                    _count: {
                        select: {
                            purchases: true
                            // {
                            //     where: {
                            //         paymentStatus: "success",
                            //     },
                            // },
                        },
                    },
                    purchases: { select: { id: true, userId: true, paymentStatus: true, presence_start: true, presence_end: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
                },
            });

            // const participants = await prisma.purchase.count({
            //             where: {
            //                 formationId,
            //                 paymentStatus: "success",
            //             },
            //         });

            const counts = await prisma.purchase.groupBy({
                by: ["formationId"],
                // where: {
                //     paymentStatus: "success",
                // },
                _count: {
                    formationId: true,
                },
            });

            const result = formations.map(f => {
                const count = counts.find(c => c.formationId === f.id);

                return {
                    ...f,
                    participants: count?._count.formationId || 0,
                };
            });

            return NextResponse.json({
                success: true, data: result
            }, { status: 200 });

        } else {

            let formations
            if (courseId) {
                formations = await prisma.course.findUnique({
                    where: { id: courseId },
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
                            select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
                        },  // formateur
                        time: true,
                        price: true,  // Lien public du fichier
                        trainerId: true,       // Image représentative
                        createdAt: true,
                        slots: {
                            orderBy: { sortOrder: "asc" },
                            select: { id: true, startsAt: true, endsAt: true, sortOrder: true },
                        },
                    },
                });
            } else if (rankedCourses) {
                formations = await prisma.course.findMany({
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
                        // price: true,  // Lien public du fichier
                        // trainerId: true,
                        // trainer: {
                        //     select: { user: { select: { id: true, name: true, email: true } }, valid: true, reject: true }
                        // },  // formateur
                        // createdAt: true,
                    },
                });
            } else {

                formations = await prisma.course.findMany({
                    where: { state: { in: ["started", "upcoming"] } },
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        domain: true,
                        state: true,
                        frontCover: true,
                        date_start: true,
                        date_end: true,
                        language: true,
                        time: true,       // Image représentative
                        price: true,  // Lien public du fichier
                        trainerId: true,
                        trainer: {
                            select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
                        },  // formateur
                        createdAt: true,
                        slots: {
                            orderBy: { sortOrder: "asc" },
                            select: { id: true, startsAt: true, endsAt: true, sortOrder: true },
                        },
                    },
                });

            }

            return NextResponse.json({
                success: true, data: formations
            }, { status: 200 });
        }



        // return NextResponse.json({ success: true, data: purchases ? formations.map(formation => ({
        //     ...formation,
        //     purchased: purchases.some(purchase => purchase.formationId === formation.id)
        // })) : formations }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des formations :", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur lors du chargement des formations." },
            { status: 500 }
        );
    }
}
