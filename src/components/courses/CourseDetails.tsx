"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Session } from "next-auth";
import {
  ArrowDownIcon,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Clock3,
  Globe2,
  GraduationCap,
  LaptopMinimal,
  OctagonAlert,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import SubscriptionButton from "@/components/subscriptions/SubscriptionButton";
import PageBreadcrumb from "../common/PageBreadCrumb";
import FallBeamBackground from "../custom/fall-beam-background";
import PurchaseForm from "../form/form-elements/PurchaseForm";
import {
  formatCourseDate,
  formatSlotRangeFr,
  getEffectiveCourseSlots,
  isSameCalendarDay,
} from "@@/lib/courseDateUtils";
import {
  DEFAULT_BACK_COVER,
  DEFAULT_FRONT_COVER,
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

type CourseSlot = {
  startsAt: Date | string;
  endsAt: Date | string;
  sortOrder?: number;
};

type Course = {
  id: string;
  title: string;
  description: string;
  language: string;
  price: number;
  domain: string;
  trainer: {
    user: {
      id: string;
      email: string;
      image?: string | null;
      name: string;
    };
  };
  time: number;
  currency: string;
  backCover: string | null;
  frontCover: string | null;
  state: string;
  trainerId: string;
  roomCode: string;
  date_start: Date;
  date_end?: Date | null;
  createdAt: Date;
  slots?: CourseSlot[] | null;
};

type Props = {
  session: Session | null;
  course: Course;
  DL_LV: boolean;
  purchased: string[];
  isTrainer: boolean;
};

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourLabel = hours > 0 ? `${hours} ${hours === 1 ? "h" : "hrs"}` : "";
  const minuteLabel =
    minutes > 0 ? `${minutes} ${minutes === 1 ? "m" : "m"}` : "";

  return [hourLabel, minuteLabel].filter(Boolean).join(" et ");
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-sky-700 dark:bg-slate-900/90 dark:text-sky-300">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-200/80 dark:text-slate-300/80">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white dark:text-white/95">
        {value}
      </p>
    </div>
  );
}

export default function CourseDetails({
  session,
  course,
  DL_LV,
  purchased,
  isTrainer,
}: Props) {
  const hasPurchased = purchased.includes(course?.id);

  const scheduleSlots = useMemo(
    () => getEffectiveCourseSlots(course?.slots, course?.date_start, course?.date_end),
    [course?.date_end, course?.date_start, course?.slots],
  );

  const durationText = useMemo(() => formatDuration(course?.time ?? 0), [course?.time]);

  const priceLabel =
    course?.price === 0
      ? "Accès libre"
      : `${course?.price ?? 0} ${course?.currency ?? "FCFA"}`;

  const periodLabel =
    course?.date_start && course?.date_end && isSameCalendarDay(course.date_start, course.date_end)
      ? `Journée du ${formatCourseDate(course.date_start)}`
      : course?.date_start && course?.date_end
        ? `Du ${formatCourseDate(course.date_start)} au ${formatCourseDate(course.date_end)}`
        : "Date non définie";

  const nextSlotLabel =
    scheduleSlots.length > 0
      ? formatSlotRangeFr(scheduleSlots[0].startsAt, scheduleSlots[0].endsAt)
      : null;

  const statusBadge = useMemo(() => {
    if (course?.state === "upcoming") {
      return (
        <Badge color="warning">
          <ArrowDownIcon />
          La formation n&apos;a pas encore débuté
        </Badge>
      );
    }

    if (course?.state === "started") {
      return (
        <Badge color="success">
          <Sparkles className="h-4 w-4" />
          La formation est en cours
        </Badge>
      );
    }

    return (
      <Badge color="error">
        <OctagonAlert className="h-4 w-4" />
        La formation est terminée
      </Badge>
    );
  }, [course?.state]);
  const backCoverSrc = resolvePublicImage(course?.backCover, "images", DEFAULT_BACK_COVER);
  const frontCoverSrc = resolvePublicImage(course?.frontCover, "images", DEFAULT_FRONT_COVER);
  const trainerImageSrc = resolvePublicImage(
    course?.trainer.user.image,
    "images",
    DEFAULT_PROFILE_IMAGE,
  );

  const accessSummary = useMemo(() => {
    if (isTrainer) {
      return {
        title: "Vous pilotez cette formation",
        description:
          course?.state === "started"
            ? "La session est active. Accédez à votre espace formateur pour suivre les inscrits et lancer la salle si nécessaire."
            : "Cette formation fait partie de vos contenus. Vous pouvez encore revoir les détails, ajuster l'organisation et suivre la préparation.",
        tone:
          "border-sky-200 bg-sky-50/90 text-sky-900 dark:border-sky-900/40 dark:bg-sky-500/10 dark:text-sky-100",
      };
    }

    if (hasPurchased) {
      return {
        title: "Votre inscription est déjà confirmée",
        description:
          course?.state === "started"
            ? "La formation est en cours. Retrouvez-la dans Mes formations pour ouvrir la fiche et rejoindre la salle au bon moment."
            : "Votre place est réservée. Suivez simplement cette formation depuis Mes formations et gardez un œil sur les rappels avant le démarrage.",
        tone:
          "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-100",
      };
    }

    return null;
  }, [course?.state, hasPurchased, isTrainer]);

  return (
    <div className="relative pb-6">
      <FallBeamBackground
        lineCount={40}
        beamColorClass="blue-400"
        className="absolute left-0 top-0 -z-1 h-full w-full"
      />

      <PageBreadcrumb pageTitle="Détails de la formation" />

      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-slate-950 shadow-[0_24px_90px_rgba(15,23,42,0.28)] dark:border-slate-800">
        <div className="absolute inset-0">
          <Image
            priority
            fill
            src={backCoverSrc}
            unoptimized={shouldBypassNextImageCache(backCoverSrc)}
            alt={course?.title || "Course cover"}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,6,23,0.92)_8%,rgba(15,23,42,0.78)_42%,rgba(2,132,199,0.18)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="relative z-10 grid gap-8 px-5 py-6 sm:px-8 sm:py-8 xl:grid-cols-[1.2fr_0.8fr] xl:px-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {statusBadge}
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.12em] text-white/85 backdrop-blur">
                {course?.domain || "Formation"}
              </span>
              {scheduleSlots.length > 1 && (
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.12em] text-white/85 backdrop-blur">
                  {scheduleSlots.length} créneaux prévus
                </span>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">
                {course?.title ? course.title : "Cette formation n'existe pas"}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
                {course?.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoChip
                icon={<CalendarDays className="h-5 w-5" />}
                label="Période"
                value={periodLabel}
              />
              <InfoChip
                icon={<Clock3 className="h-5 w-5" />}
                label="Durée"
                value={durationText || "À définir"}
              />
              <InfoChip
                icon={<Wallet className="h-5 w-5" />}
                label="Tarif"
                value={priceLabel}
              />
              <InfoChip
                icon={<Globe2 className="h-5 w-5" />}
                label="Langue"
                value={course?.language || "Non précisée"}
              />
            </div>

            {accessSummary && (
              <div
                className={`rounded-3xl border p-5 shadow-sm ${accessSummary.tone}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-current shadow-sm dark:bg-slate-950/50">
                    {isTrainer ? (
                      <GraduationCap className="h-6 w-6" />
                    ) : (
                      <BookOpenText className="h-6 w-6" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">{accessSummary.title}</h2>
                    <p className="text-sm leading-6 opacity-90">
                      {accessSummary.description}
                    </p>
                    {nextSlotLabel && (
                      <p className="text-sm font-medium">
                        Prochain repère : {nextSlotLabel}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-md">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                <Image
                  fill
                  src={frontCoverSrc}
                  unoptimized={shouldBypassNextImageCache(frontCoverSrc)}
                  alt={course?.title || "Formation"}
                  className="object-cover"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 text-white shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-md">
              <div className="flex items-start gap-4">
                <Link
                  target="_blank"
                  href={{
                    pathname: "/profile",
                    query: {
                      trainerId: course?.trainer.user.id,
                    },
                  }}
                  className="flex h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-sky-200 shadow-lg"
                >
                  <Image
                    width={96}
                    height={96}
                    alt={course?.trainer.user.name || ""}
                    src={trainerImageSrc}
                    unoptimized={shouldBypassNextImageCache(trainerImageSrc)}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-200/75">
                    Formateur
                  </p>
                  <h3 className="text-xl font-semibold">
                    {course?.trainer.user.name}
                  </h3>
                  <p className="text-sm leading-6 text-slate-200/80">
                    Consultez le profil du formateur pour en savoir plus sur son
                    expertise et ses autres contenus.
                  </p>
                  <Link
                    target="_blank"
                    href={{
                      pathname: "/profile",
                      query: {
                        trainerId: course?.trainer.user.id,
                      },
                    }}
                    className="inline-flex items-center text-sm font-medium text-sky-200 transition hover:text-white"
                  >
                    Voir le profil
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  {session?.user?.id && session.user.id !== course?.trainer.user.id && (
                    <SubscriptionButton
                      trainerId={course?.trainer.user.id}
                      className="pt-2"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Planning détaillé
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tous les rendez-vous sont classés dans l&apos;ordre chronologique.
                </p>
              </div>
            </div>

            {scheduleSlots.length > 0 ? (
              <div className="space-y-4">
                {scheduleSlots.map((slot, index) => (
                  <div
                    key={`${slot.startsAt.toString()}-${index}`}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatSlotRangeFr(slot.startsAt, slot.endsAt)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Session {index + 1} sur {scheduleSlots.length}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                Aucun horaire détaillé n&apos;a encore été renseigné pour cette
                formation.
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                <LaptopMinimal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  À propos de cette expérience
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Une vue rapide de ce que l&apos;apprenant doit retenir avant de
                  rejoindre la session.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <UserRound className="mb-3 h-5 w-5 text-sky-600 dark:text-sky-300" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Accompagnement
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  La formation est animée directement par {course?.trainer.user.name}.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <Clock3 className="mb-3 h-5 w-5 text-sky-600 dark:text-sky-300" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Rythme
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Durée estimée : {durationText || "à définir"}.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <BookOpenText className="mb-3 h-5 w-5 text-sky-600 dark:text-sky-300" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Format
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Les sessions sont suivies en ligne avec accès à la fiche de la
                  formation depuis votre espace personnel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div id="purchaseForm" className="space-y-6">
          <PurchaseForm
            Session={session}
            CourseId={course?.id}
            CoursePrice={course?.price ? Number(course?.price) : 0}
            CourseCurrency={course?.currency || "XAF"}
            purchased={hasPurchased}
            DL_LV={DL_LV}
            isTrainer={isTrainer}
            courseTitle={course?.title}
            courseState={course?.state}
            nextSlotLabel={nextSlotLabel}
          />
        </div>
      </section>
    </div>
  );
}
