export const COURSE_BROADCAST_EVENT = "course-change";
export const PUBLIC_COURSES_CHANNEL = "catalog-courses";

export type CourseBroadcastType =
  | "course.created"
  | "course.updated"
  | "course.moderator.active"
  | "course.moderator.inactive";

export type RealtimeCourseUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type RealtimeCourse = {
  id: string;
  title: string;
  description: string;
  domain: string;
  state: string;
  roomCode: string;
  date_start: string;
  date_end: string;
  frontCover: string | null;
  time: number;
  price: number;
  currency: string;
  trainerId: string;
  trainer: { user: RealtimeCourseUser };
  createdAt: string;
  updatedAt: string | null;
  language: string;
  participants: number;
  moderatorActif: boolean;
  slots?: {
    startsAt: string | Date;
    endsAt: string | Date;
    sortOrder?: number;
  }[];
};

export type CourseBroadcastPayload = {
  type: CourseBroadcastType;
  courseId: string;
  course: RealtimeCourse;
  sentAt: string;
};

export const getUserCoursesChannel = (userId: string) => `user-courses:${userId}`;

export const getTrainerCoursesChannel = (userId: string) =>
  `trainer-courses:${userId}`;
