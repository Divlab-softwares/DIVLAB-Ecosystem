
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@@/lib/authOption"
import MyLaunchedCourses from "@/components/courses/MyLaunchedCourses";
import { setModaratorActif } from "@@/lib/setModeratorActif";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { generateRoom } from "@@/lib/generateRoom";

export const metadata: Metadata = {
  title:
    "My launched courses | DIVLAB - Train",
  description: "Page destinee au formateur, contenant toutes les formations qu'il a mis en place. Il peut donc les modifier ou mettre a jour.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/courses_state",
  },
};



type Courses = {
  id: string,
  title: string,
  description: string,
  domain: string,
  state: string,
  roomCode: string,
  date_start: string,
  date_end: string,
  time: string,       // Image représentative
  price: number,  // Lien public du fichier
  trainerId: number,
  // trainer: User,  // formateur
  createdAt: Date,
  updatedAt: string,
  language: string,
  currency: string,
  participants: number,
  frontCover: string,

};


export default async function MyCoursesState() {
  const session = await getServerSession(authOptions);

  return (
    <div className="">
      <MyLaunchedCourses session={session} />
    </div>
  );
}
