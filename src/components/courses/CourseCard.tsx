"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownIcon, ArrowUpIcon, CalendarDays, Clock3, ShieldAlert, Users } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useLocale } from "@/context/LocaleContext";
import {
  formatCurrencyAmount,
  formatDurationLabel,
  formatUiDate,
  normalizeCourseLanguage,
} from "@/lib/i18n";
import { isSameCalendarDay } from "@@/lib/courseDateUtils";
import {
  DEFAULT_FRONT_COVER,
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

type TrainerPreview = {
  id: string;
  name: string;
  image?: string | null;
};

type CourseCardProps = {
  title: string;
  domain?: string | null;
  frontCover?: string | null;
  time: number;
  price: number;
  currency?: string | null;
  language?: string | null;
  state: string;
  dateStart?: string | Date | null;
  dateEnd?: string | Date | null;
  trainer?: TrainerPreview | null;
  detailsHref: { pathname: string; query?: Record<string, string | boolean> };
  trainerHref?: { pathname: string; query?: Record<string, string> };
  participants?: number;
  accessKey?: string | null;
  bodyExtra?: React.ReactNode;
  footer?: React.ReactNode;
  onDetailsClick?: () => void;
  priority?: boolean;
};

function CourseStatusBadge({ state }: { state: string }) {
  const { t } = useLocale();

  if (state === "upcoming") {
    return (
      <Badge color="warning">
        <ArrowDownIcon className="h-3.5 w-3.5" />
        {t("courses.status.upcoming")}
      </Badge>
    );
  }

  if (state === "started") {
    return (
      <Badge color="success">
        <ArrowUpIcon className="h-3.5 w-3.5" />
        {t("courses.status.started")}
      </Badge>
    );
  }

  return (
    <Badge color="error">
      <ShieldAlert className="h-3.5 w-3.5" />
      {t("courses.status.completed")}
    </Badge>
  );
}

export default function CourseCard({
  title,
  domain,
  frontCover,
  time,
  price,
  currency,
  language,
  state,
  dateStart,
  dateEnd,
  trainer,
  detailsHref,
  trainerHref,
  participants,
  accessKey,
  bodyExtra,
  footer,
  onDetailsClick,
  priority = false,
}: CourseCardProps) {
  const { locale, t } = useLocale();

  const periodLabel =
    dateStart && dateEnd
      ? isSameCalendarDay(dateStart, dateEnd)
        ? t("courses.dayOf", { date: formatUiDate(dateStart, locale) })
        : t("courses.fromTo", {
          start: formatUiDate(dateStart, locale),
          end: formatUiDate(dateEnd, locale),
        })
      : t("courses.dateUndefined");
  const coverSrc = resolvePublicImage(frontCover, "images", DEFAULT_FRONT_COVER);
  const trainerImageSrc = resolvePublicImage(
    trainer?.image,
    "images",
    DEFAULT_PROFILE_IMAGE,
  );

  return (
    <article className="dashboard-panel dashboard-grid-background group overflow-hidden p-4 transition duration-300 hover:-translate-y-1 sm:p-5">
      <Link href={detailsHref} className="block" onClick={onDetailsClick}>
        <div className="relative overflow-hidden rounded-[24px]">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
          <Image
            priority={priority}
            width={1200}
            height={720}
            alt={title}
            src={coverSrc}
            unoptimized={shouldBypassNextImageCache(coverSrc)}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
            <span className="dashboard-stat-chip border-0 bg-white/92 text-slate-700 dark:bg-slate-950/85 dark:text-white">
              {domain || t("common.notDefined")}
            </span>
            <CourseStatusBadge state={state} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between gap-3">
            <div className="max-w-[70%]">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                {state === "started" ? t("courses.live") : t("courses.catalog")}
              </p>
              <h3 className="line-clamp-2 text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h3>
            </div>

            {trainer && trainerHref ? (
              <Link
                href={trainerHref}
                target="_blank"
                className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/40 shadow-[0_10px_30px_rgba(15,23,42,0.35)]"
              >
                <Image
                  width={160}
                  height={160}
                  alt={trainer.name}
                  src={trainerImageSrc}
                  unoptimized={shouldBypassNextImageCache(trainerImageSrc)}
                  className="h-full w-full object-cover"
                />
              </Link>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="dashboard-subpanel p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("courses.period")}
          </p>
          <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <CalendarDays className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" />
            <span>{periodLabel}</span>
          </div>
        </div>
        <div className="dashboard-subpanel p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("courses.duration")}
          </p>
          <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <Clock3 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
            <span>{formatDurationLabel(time, locale) || t("common.notAvailable")}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("courses.price")}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {price === 0
              ? t("common.free")
              : formatCurrencyAmount(price, locale, currency || t("common.currency"))}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("courses.language")}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {normalizeCourseLanguage(language, locale)}
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("courses.trainer")}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {trainer?.name || t("common.unknown")}
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {t("stats.learners")}
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Users className="h-4 w-4 text-violet-600 dark:text-violet-300" />
            <span>{participants ?? 0}</span>
          </div>
        </div>

      </div>

      {(accessKey || bodyExtra) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          {accessKey ? (
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200">
              <span className="font-semibold">{t("courses.accessKey")}:</span> {accessKey}
            </div>
          ) : (
            <div />
          )}
          {bodyExtra}
        </div>
      )}

      {footer ? <div className="mt-5 flex flex-col gap-3">{footer}</div> : null}
    </article>
  );
}
