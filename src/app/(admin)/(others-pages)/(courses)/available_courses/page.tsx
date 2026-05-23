import { Suspense } from "react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import AvailableCourses from "@/components/courses/AvailableCourses";
import { prisma } from "@@/lib/prisma";
import {
  DEFAULT_FRONT_COVER,
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
} from "@@/lib/imageSources";

export const metadata: Metadata = {
  title: "Formations disponibles",
  description:
    "Page de presentation des formations disponibles sur DIVLAB Train. Decouvrez notre catalogue de formations en ligne couvrant divers domaines tels que la data science, l'intelligence artificielle, le design graphique et la creation de sites web.",
  alternates: {
    canonical: "/available_courses",
  },
  openGraph: {
    title: "Formations disponibles | DIVLAB Train",
    description:
      "Decouvrez les formations disponibles sur DIVLAB Train et rejoignez des sessions en ligne animees par des formateurs specialises.",
    url: "/available_courses",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formations disponibles | DIVLAB Train",
    description:
      "Catalogue des formations en ligne disponibles sur DIVLAB Train.",
  },
};

type Courses = {
  id: string;
  title: string;
  description: string;
  domain: string;
  frontCover: string;
  time: number;
  price: number;
  currency: string;
  trainerId: string;
  trainer: {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
    valid: boolean;
    reject: boolean;
  };
  createdAt: Date;
  language: string;
  state: string;
  date_start: Date;
  date_end: Date;
  updatedAt: Date;
};

const getCachedProducts = unstable_cache(
  async () => {
    const formations = await prisma.course.findMany({
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
        time: true,
        price: true,
        currency: true,
        trainerId: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });


    const counts = await prisma.purchase.groupBy({
      by: ["formationId"],
      where: {
        paymentStatus: "success",
      },
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



    const withPublicImg: Courses[] = (result).map((course: any) => ({
      ...course,
      trainer: {
        ...course.trainer,
        user: {
          ...course.trainer.user,
          image: resolvePublicImage(
            course.trainer.user.image,
            "images",
            DEFAULT_PROFILE_IMAGE,
          ),
        },
      },
      frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
    })) as Courses[];

    return withPublicImg;
  },
  ["courses-list"],
  { revalidate: 60, tags: ["courses"] },
);

export default async function AvailableCoursesHome() {
  const courses = await getCachedProducts();

  return (
    <Suspense fallback={<p>Chargement des produits...</p>}>
      <div>
        <AvailableCourses courses={courses} />
      </div>
    </Suspense>
  );
}
