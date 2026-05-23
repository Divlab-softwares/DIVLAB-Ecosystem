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

        let formations;

        if (userId) {
            const notifications = await prisma.notification.findMany({
                where: { destinatorUserId: userId },
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    initiator: { select: { name: true, email: true, image: true } },
                    destinator: { select: { name: true, email: true, image: true } },
                    subject: true,
                    description: true,
                    type: true,
                    createdAt: true,
                },
            });



            return NextResponse.json({
                success: true, data: notifications
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

            formations = await prisma.course.findMany({
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
                    currency: true,
                    state: true,
                    language: true,
                    trainer: {
                        select: { user: { select: { name: true, email: true } }, valid: true, reject: true }
                    },   // formateur
                    time: true,       // Image représentative
                    price: true,  // Lien public du fichier
                    trainerId: true,       // Image représentative
                    createdAt: true,
                    purchases: { select: { id: true, userId: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
                },
            });

            const purchased_formation_counts = formations.reduce((acc, formation) => {
                acc[formation.id] = formation.purchases.length;
                return acc;
            }, {});

            return NextResponse.json({
                success: true, data: formations, purchased_formation_counts
            }, { status: 200 });

        } else {


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
                        language: true,
                        currency: true,
                        state: true,
                        trainer: {
                            select: { user: { select: { name: true, email: true } }, valid: true, reject: true }
                        },  // formateur
                        time: true,
                        price: true,  // Lien public du fichier
                        trainerId: true,       // Image représentative
                        createdAt: true,
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
                        date_start: true,
                        date_end: true,
                        language: true,
                        time: true,       // Image représentative
                        price: true,  // Lien public du fichier
                        trainerId: true,
                        trainer: {
                            select: { user: { select: { name: true, email: true } }, valid: true, reject: true }
                        },  // formateur
                        createdAt: true,
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


export async function POST(req) {
    const data = await req.json();
    const initiatorId = data.userId
    const destinatorId = data.destinatorId
    const trainerId = data.trainerId

    if (destinatorId) {


        // const notificationsUpsert = await prisma.notification.upsert({
        //     where: { destinatorId: data.userId },
        //     update: { newNotif: false },
        //     create: {
        //         ...data,
        //         newNotif: true
        //     }
        // });

        // const existing_trainer = await prisma.notification.findAll({ where: { destinatorId: destinatorId } });
        // // On verifi si il existe un utilisateur avec ces infos de formateur


        // if (existing_trainer && existing_trainer.destinatorId !== destinatorId) {
        //     console.log("Response from /api/setUserInfo:", data);
        //     return NextResponse.json({ error: "Ce nom de formateur est déjà utilisé par un autre utilisateur." }, { status: 400 });

        // }

        await prisma.notification.update({
            where: { destinatorUserId: destinatorId, newNotif: true },
            data: {
                newNotif: false
            },
        });



    } else if (initiatorId) {

        // On met à jour l'enregistrement de l'user existant
        await prisma.notification.create({
            data: {
                description: data.description,
                initiatorId: data.initiatorId,
            },
        });
    }



    return NextResponse.json({ ok: true });
}