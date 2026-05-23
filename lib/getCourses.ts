'use server'

import { prisma } from "@@/lib/prisma";
import getSupabasePublicLink from "./getSupabasePublicLink";

export const getCourses = async (trainerId: string) => {
    try {
        if (!trainerId) {
            return [];
        }

        const realTrainerId = await prisma.trainer.findUnique({
            where: { userId: trainerId },
            select: { id: true },
        });

        if (!realTrainerId) {
            return { error: "Ce formateur n'existe pas." };
        }

        const formations = await prisma.course.findMany({
            where: { trainerId: realTrainerId.id },
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
                backCover: true,
                currency: true,
                state: true,
                language: true,
                trainer: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                        valid: true,
                        reject: true,
                    },
                },
                time: true,
                price: true,
                trainerId: true,
                createdAt: true,
                updatedAt: true,
                moderatorActif: true,
                _count: {
                    select: {
                        purchases: true,
                    },
                },
                purchases: {
                    select: {
                        id: true,
                        userId: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                                bio: true,
                                post: true,
                                role: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });

        const counts = await prisma.purchase.groupBy({
            by: ["formationId"],
            _count: {
                formationId: true,
            },
        });

        const result = formations.map((formation) => {
            const count = counts.find((item) => item.formationId === formation.id);

            return {
                ...formation,
                participants: count?._count.formationId || 0,
            };
        });

        return result.map((course: any) => ({
            ...course,
            trainer: {
                ...course.trainer, user: {
                    ...course.trainer.user, image: (getSupabasePublicLink(course.trainer.user.image as string, "images") ?? ("https://djamqnjqfomxqtxeryyk.supabase.co/storage/v1/object/public/images/" + course.trainer.user.image as string)) as string
                }
            },
            frontCover:
                (getSupabasePublicLink(course.frontCover as string, "images") ??
                    (course.frontCover as string)) as string,
        }));

    } catch (error) {
        console.error("Erreur lors de la recuperation des formations :", error);
        return { error: "Erreur serveur" };
    }
}
