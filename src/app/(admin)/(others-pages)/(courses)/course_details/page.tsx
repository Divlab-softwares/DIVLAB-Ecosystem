import { Metadata } from 'next';
import { getCourseById, getPurchasedCourses } from "@@/lib/db-queries";
import React from "react";

import { prisma } from "@@/lib/prisma"; // Ajustez le chemin selon votre config
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@@/lib/authOption"
import CourseDetails from "@/components/courses/CourseDetails";
import { User } from "@@/lib/getUserInfoLib";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//     title:
//         "DIVLAB Training Dashboard | DIVLAB",
//     description: "This is  ",
// };

type Props = {
  params: { id: string };
};

type Course = {
  id: string;
  title: string;
  description: string;
  language: string;
  price: number;
  domain: string;
  trainer: { user: User };
  time: string;
  currency: string;
  backCover: string;
  state: string;
  trainerId: string;
  roomCode: string;
  date_start: Date;
  date_end?: Date | null;
  createdAt: Date;
  updatedAt: string;
};




const checkIsTrainer = async (userId: string, courseId: string): Promise<boolean> => {
  try {
    const existingTrainer = await prisma.trainer.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!existingTrainer) return false

    const count = await prisma.course.count({
      where: {
        id: courseId,
        trainerId: existingTrainer.id,
      },
    });

    return count > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification du formateur :", error);
    return false;
  }
};





export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}): Promise<Metadata> {

  const query = await searchParams;
  const id = query.courseId;

  // const { id } = await params;

  if (!id) return { title: "Formation introuvable" };

  const data = await getCourseById(id);

  if (!data) return { title: "Formation non trouvée" };


  const defaultImage = "https://djamqnjqfomxqtxeryyk.supabase.co/storage/v1/object/public/images/covers/default/default_backCover.jpeg";

  // On s'assure que l'URL est une string et non null/undefined
  const ogImage = data?.frontCover || defaultImage;
  return {
    title: data?.title,
    description: data?.description,
    openGraph: {
      title: data?.title,
      description: data?.description,
      type: 'article', // ou wbsite
      images: [
        {
          url: ogImage,
          width: 1200,      // Largeur recommandée
          height: 630,     // Hauteur recommandée
          alt: data?.title, // Texte alternatif pour l'accessibilité
        },
      ], // URL complète
    },

    // Spécifique à X (Twitter) pour l'affichage en grand format
    twitter: {
      card: 'summary_large_image',
      title: data?.title,
      description: data?.description,
      images: [ogImage],
    },
  };
}

const CourseDetailsHome = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) => {
  // const sp = useSearchParams();
  const session = await getServerSession(authOptions);

  const query = await searchParams;
  const courseId = query.courseId;
  //const [course, setCourse] = useState<Course | null>(null);
  const DL_LV = query.DL_LV ? true : false

  const course = await getCourseById(courseId);


  const purchased = await getPurchasedCourses(session?.user.id!);
  const isTrainer: boolean = await checkIsTrainer(session?.user.id ? session?.user.id : "", courseId)

  return (
    <div>
      {!courseId && (
        <div>Loading...</div>
      )}
      <CourseDetails session={session} course={course!} DL_LV={DL_LV} purchased={purchased ? purchased : []} isTrainer={isTrainer} />

    </div>
  );
}

export default CourseDetailsHome;
