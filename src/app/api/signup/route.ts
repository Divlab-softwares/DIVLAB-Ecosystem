import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { name,surname, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "Vous avez dejà un compte, vous serez directement connecte !" , signedUp: true}, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                name,
                surname,
                email,
                password,
            },
        });

        return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}