'use server'

import { prisma } from "@@/lib/prisma";
import { broadcastCourseChange } from "@@/lib/courseRealtime.server";

export const setModaratorActif = async (courseId: string) => {
    try {
        await prisma.course.update({
            where: {
                id: courseId,
            },
            data: {
                moderatorActif: true,
            },
        });

        // La base reste la source de verite, puis on diffuse le nouvel etat.
        await broadcastCourseChange(courseId, "course.moderator.active");

        return { success: true };
    } catch (error) {
        console.error("LOG ERROR:", error);
        return { error: "Erreur serveur" };
    }
}
