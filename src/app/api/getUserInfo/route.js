import { NextResponse } from "next/server";
import { prisma } from "@@/lib/prisma";
import { userProfileSelect } from "@@/lib/userProfile";

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

        let formations;

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: userProfileSelect,
            });


            return NextResponse.json({
                success: true, data: user
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
                        state: true,
                        trainer: true,  // formateur
                        time: true,       // Image représentative
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
                        trainer: true,  // formateur
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
