
import type { Metadata } from "next";
import MyCourses from "@/components/courses/MyCourses";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption"
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import { prisma } from "@@/lib/prisma";
import { ClipLoader } from "react-spinners";
import type { RealtimeCourse } from "@@/lib/courseRealtimeTypes";
import {
  DEFAULT_BACK_COVER,
  DEFAULT_FRONT_COVER,
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
} from "@@/lib/imageSources";

export const metadata: Metadata = {
  title:
    "Vos Formations ",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/my_courses",
  },
  description: "Page de suivi de vos formations en ligne sur DIVLAB Train. Consultez vos cours en cours, votre progression et accédez à vos ressources de formation pour continuer à apprendre et à vous développer avec DIVLAB Train.",
};


type Courses = RealtimeCourse;

type Purchase = {
  id: string,
  formationId: string,
  formation: Courses,
  accessToken: string,
  paymentStatus: string,
  userId: string,
  createdAt: string,
};

const getCourses = async (userId: string) => {
  const purchases = await prisma.purchase.findMany({
    where: { userId, paymentStatus: "success" },
    orderBy: { createdAt: "asc" },
    select: {
      // id: true,
      formationId: true,
      // formation: {
      //     select: {
      //         id: true,
      //         title: true,
      //         description: true,
      //         domain: true,
      //         date_start: true,
      //         date_end: true,
      //         roomCode: true,
      //         currency: true,
      //         state: true,
      //         language: true,
      //         trainer: {
      //             select: { user: { select: {id:true,  name: true, email: true } }, valid: true, reject:true}
      //         },   // formateur
      //         time: true,       // Image représentative
      //         price: true,  // Lien public du fichier
      //         trainerId: true,       // Image représentative
      //         createdAt: true,
      //     }
      // },
      accessToken: true,
      paymentStatus: true,
      userId: true,
      createdAt: true,
    },
  });

  const formations = await prisma.course.findMany({
    where: {
      purchases: {
        some: {
          userId,
          paymentStatus: "success",
        }
      }
    },
    orderBy: { date_start: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      domain: true,
      date_start: true,
      date_end: true,
      frontCover: true,
      roomCode: true,
      currency: true,
      state: true,
      language: true,
      trainer: {
        select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
      },   // formateur
      time: true,       // Image représentative
      price: true,  // Lien public du fichier
      trainerId: true,       // Image représentative
      createdAt: true,
      moderatorActif: true,
      slots: {
        select: {
          startsAt: true,
          endsAt: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          purchases: true
          // {
          //     where: {
          //         paymentStatus: "success",
          //     },
          // },
        },
      },
      // purchases: { select: { id: true, userId: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
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
    ...(course as Courses),
    trainer: {
      ...course.trainer, user: {
        ...course.trainer.user, image: resolvePublicImage(course.trainer.user.image, "images", DEFAULT_PROFILE_IMAGE) } },
    frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
    backCover: resolvePublicImage(course.backCover, "images", DEFAULT_BACK_COVER),
  }));

  const sortedCourses = withPublicImg.sort((a, b) => {
    return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
  });
  
  console.log("Date d'aujourdhui", Date.now())
  return { purchase: purchases as unknown as Purchase[], myCourses: sortedCourses } // Ton appel BD réel
}



// On crée une version "cachée" de ta fonction de récupération
const getCachedProducts = (userId: string) => unstable_cache(
  async () => {
    const purchases = await prisma.purchase.findMany({
      where: { userId, paymentStatus: "success" },
      orderBy: { createdAt: "asc" },
      select: {
        // id: true,
        formationId: true,
        // formation: {
        //     select: {
        //         id: true,
        //         title: true,
        //         description: true,
        //         domain: true,
        //         date_start: true,
        //         date_end: true,
        //         roomCode: true,
        //         currency: true,
        //         state: true,
        //         language: true,
        //         trainer: {
        //             select: { user: { select: {id:true,  name: true, email: true } }, valid: true, reject:true}
        //         },   // formateur
        //         time: true,       // Image représentative
        //         price: true,  // Lien public du fichier
        //         trainerId: true,       // Image représentative
        //         createdAt: true,
        //     }
        // },
        accessToken: true,
        paymentStatus: true,
        userId: true,
        createdAt: true,
      },
    });

    const formations = await prisma.course.findMany({
      where: {
        purchases: {
          some: {
            userId,
            paymentStatus: "success",
          }
        }
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        domain: true,
        date_start: true,
        date_end: true,
        frontCover: true,
        backCover: true,
        roomCode: true,
        currency: true,
        state: true,
        language: true,
        trainer: {
          select: { user: { select: { id: true, name: true, email: true, image: true } }, valid: true, reject: true }
        },   // formateur
        time: true,       // Image représentative
        price: true,  // Lien public du fichier
        trainerId: true,       // Image représentative
        createdAt: true,
        moderatorActif: true,
        slots: {
          select: {
            startsAt: true,
            endsAt: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            purchases: true
            // {
            //     where: {
            //         paymentStatus: "success",
            //     },
            // },
          },
        },
        // purchases: { select: { id: true, userId: true, user: { select: { name: true, email: true, bio: true, post: true, role: true, phone: true } } } },
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
      ...(course as Courses),
      trainer: {
        ...course.trainer,
        user: {
          ...course.trainer.user,
          image: resolvePublicImage(course.trainer.user.image, "images", DEFAULT_PROFILE_IMAGE),
        },
      },
      frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
      backCover: resolvePublicImage(course.backCover, "images", DEFAULT_BACK_COVER),
    }));
    console.log("Date d'aujourdhui", Date.now())
    return { purchase: purchases as unknown as Purchase[], myCourses: withPublicImg } // Ton appel BD réel
  },
  ['my-courses', userId], // Une clé unique pour ce cache
  { revalidate: 60, tags: [`my-courses-${userId}`] }
)();

export default async function MyCoursesHome({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const session = await getServerSession(authOptions);
  const query = await searchParams;
  const update = query.update;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let courses;

  // if (update) {
  //   await sleep(1000); // Attend 1 seconde (ajuste selon tes besoins)
  //   courses = await getCourses(session?.user?.id || "");
  // } else {
  //   courses = await getCachedProducts(session?.user?.id || "");
  // }

  courses = await getCourses(session?.user?.id || "");
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center mt-5">

        <ClipLoader
          color="#36d7b7"
          loading={true}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p>Veuillez patienter...</p>
      </div>}>

      <div className="">
        <MyCourses session={session} myCourses={courses.myCourses} myPurchases={courses.purchase} />
      </div>
    </Suspense>
  );
}
