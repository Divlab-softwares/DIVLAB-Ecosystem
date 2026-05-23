import { NextRequest, NextResponse } from "next/server";
import { createAppNotification } from "@@/lib/notifications.server";
import { prisma } from "@@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            courseId,
            userId,
            token,
            role,
            action,
        } = body;

        if (!courseId) {
            return NextResponse.json(
                { error: "courseId requis" },
                { status: 400 }
            );
        }

        const ipAddress =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown";

        const userAgent = req.headers.get("user-agent") || "unknown";

        await prisma.courseLog.create({
            data: {
                courseId,
                userId,
                token,
                role,
                action,
                ipAddress,
                userAgent,
            },
        });

        if (userId && action === "join") {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: {
                    title: true,
                    trainer: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });

            if (course?.trainer.userId && course.trainer.userId !== userId) {
                await createAppNotification({
                    initiatorUserId: userId,
                    destinatorUserId: course.trainer.userId,
                    description: "a rejoint la formation",
                    subject: course.title,
                    type: "log",
                });
            }
        }

        // if (role === "trainer") {
        //     await prisma.course.update({
        //         where: {
        //             id: courseId, // Remplace par l'ID réel du cours à mettre à jour
        //         },
        //         data: {
        //             moderatorActif: true,
        //         },
        //     });
        // }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("LOG ERROR:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
