import { prisma } from "@@/lib/prisma";
import {
  DEFAULT_FRONT_COVER,
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
} from "@@/lib/imageSources";
import { getSupabaseAdminClient } from "@@/lib/supabaseAdmin";
import {
  COURSE_BROADCAST_EVENT,
  PUBLIC_COURSES_CHANNEL,
  type CourseBroadcastPayload,
  type CourseBroadcastType,
  type RealtimeCourse,
  getTrainerCoursesChannel,
  getUserCoursesChannel,
} from "@@/lib/courseRealtimeTypes";

type BroadcastRecipients = {
  trainerUserId: string;
  userIds: string[];
};

async function getCourseRecipients(courseId: string): Promise<BroadcastRecipients | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      trainer: {
        select: {
          user: {
            select: { id: true },
          },
        },
      },
      purchases: {
        select: { userId: true },
      },
    },
  });

  if (!course) {
    return null;
  }

  const userIds = [...new Set(course.purchases.map((purchase) => purchase.userId))];

  return {
    trainerUserId: course.trainer.user.id,
    userIds,
  };
}

export async function getCourseRealtimeSnapshot(
  courseId: string,
): Promise<RealtimeCourse | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      domain: true,
      state: true,
      roomCode: true,
      date_start: true,
      date_end: true,
      frontCover: true,
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
        },
      },
      createdAt: true,
      updatedAt: true,
      language: true,
      moderatorActif: true,
      _count: {
        select: {
          purchases: true,
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    domain: course.domain,
    state: course.state,
    roomCode: course.roomCode,
    date_start: course.date_start.toISOString(),
    date_end: course.date_end.toISOString(),
    frontCover: resolvePublicImage(course.frontCover, "images", DEFAULT_FRONT_COVER),
    time: course.time,
    price: course.price,
    currency: course.currency,
    trainerId: course.trainerId,
    trainer: {
      user: {
        id: course.trainer.user.id,
        name: course.trainer.user.name ?? "Inconnu",
        email: course.trainer.user.email ?? "",
        image: resolvePublicImage(course.trainer.user.image, "images", DEFAULT_PROFILE_IMAGE),
      },
    },
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt?.toISOString() ?? null,
    language: course.language,
    participants: course._count.purchases,
    moderatorActif: course.moderatorActif,
  };
}



async function sendBroadcast(
  channelName: string,
  payload: CourseBroadcastPayload,
  isPrivate = true,
) {
  const supabaseAdmin = getSupabaseAdminClient();
  const channel = supabaseAdmin.channel(channelName, {
    config: { private: isPrivate },
  });

  const subscribed = await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        clearTimeout(timeout);
        resolve(true);
      }

      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });

  if (!subscribed) {
    await supabaseAdmin.removeChannel(channel);
    throw new Error(`Unable to subscribe to Supabase channel ${channelName}.`);
  }

  await channel.send({
    type: "broadcast",
    event: COURSE_BROADCAST_EVENT,
    payload,
  });

  await supabaseAdmin.removeChannel(channel);
}

export async function broadcastCourseChange(
  courseId: string,
  type: CourseBroadcastType,
) {
  const [course, recipients] = await Promise.all([
    getCourseRealtimeSnapshot(courseId),
    getCourseRecipients(courseId),
  ]);

  if (!course || !recipients) {
    return null;
  }

  const payload: CourseBroadcastPayload = {
    type,
    courseId,
    course,
    sentAt: new Date().toISOString(),
  };

  const privateChannels = new Set<string>([
    getTrainerCoursesChannel(recipients.trainerUserId),
    ...recipients.userIds.map((userId) => getUserCoursesChannel(userId)),
  ]);

  await Promise.all(
    [
      ...[...privateChannels].map((channelName) =>
        sendBroadcast(channelName, payload, true),
      ),
      sendBroadcast(PUBLIC_COURSES_CHANNEL, payload, false),
    ],
  );

  return payload;
}
