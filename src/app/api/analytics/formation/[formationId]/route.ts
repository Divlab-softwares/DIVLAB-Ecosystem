import { prisma } from "@@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ formationId: string }> }
) {
    const { formationId } = await context.params;

    try {
        const participants = await prisma.purchase.count({
            where: {
                formationId,
                // paymentStatus: "success",
            },
        });

        return NextResponse.json({ participants });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}