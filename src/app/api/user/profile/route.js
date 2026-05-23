import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@@/lib/authOption";
import { getUserProfileById } from "@@/lib/userProfile";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Utilisateur non authentifie." },
                { status: 401 },
            );
        }

        const user = await getUserProfileById(userId);

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Utilisateur introuvable." },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la recuperation du profil utilisateur :", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur lors du chargement du profil." },
            { status: 500 },
        );
    }
}
