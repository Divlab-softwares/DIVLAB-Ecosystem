import { prisma } from "@@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ trainerId: string }> }
) {
    const { trainerId } = await context.params;

    const realTrainerId = await prisma.trainer.findUnique({
        where: { userId: trainerId },
        select: { id: true },
    });

    if (!realTrainerId) {
        return NextResponse.json({
            success: false, error: "Ce formateur n'existe pas."
        }, { status: 400 });
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
            const loc = p.user.country || p.user.location || "Unknown";
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

        return NextResponse.json({
            totalFormations,
            totalPurchases,
            participantsByMonth: participantsResult,
            revenueByMonth: revenueResult,
            locations: locationResult,
            formationsByMonth: formationsByMonthResult,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
