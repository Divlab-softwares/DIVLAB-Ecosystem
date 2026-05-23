"use client";

import React, { Suspense, useMemo, useState } from "react";
import type { Session } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Globe,
  LineChart,
  PlayCircle,
  Rocket,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useLocale } from "@/context/LocaleContext";
import { formatCurrencyAmount } from "@/lib/i18n";
import BeamGridBackground from "../custom/beam-grid-background";
import BentoGrid from "../custom/bentoGrid";

type Courses = {
  id: string;
  title: string;
  description: string;
  domain: string;
  state: string;
  roomCode: string;
  date_start: Date;
  date_end: Date;
  time: number;
  price: number;
  trainerId: string;
  trainer: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    valid: boolean;
    reject: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  language: string;
  currency: string;
  frontCover: string;
  backCover: string;
};

type TrainerAnalytics = {
  totalFormations: number;
  totalPurchases: number;
  participantsByMonth: { month: string; participants: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  locations: { location: string; count: number; percentage: number }[];
  formationsByMonth: { month: string; formations: number }[];
  trainerCourses: Courses[] | null;
};

type Props = {
  session: Session | null;
  initialRankedCourses?: Courses[];
  initialTrainerFormation?: TrainerAnalytics | null;
};

function QuickActionCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function LearnerHome({
  session,
  rankedCourses,
}: {
  session: Session | null;
  rankedCourses: Courses[];
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const featuredStats = useMemo(() => {
    return {
      totalCourses: rankedCourses.length,
      totalDomains: new Set(
        rankedCourses.map((course) => course.domain).filter(Boolean),
      ).size,
      totalFreeCourses: rankedCourses.filter((course) => course.price === 0).length,
    };
  }, [rankedCourses]);

  const handleNavigate = (path: string) => {
    if (loadingTarget) {
      return;
    }

    setLoadingTarget(path);
    router.push(path);
  };

  const isAuthenticated = Boolean(session?.user?.id);
  const welcomeTitle = isAuthenticated
    ? t("home.learner.welcomeAuth")
    : t("home.learner.welcomeGuest");
  const welcomeText = isAuthenticated
    ? t("home.learner.textAuth")
    : t("home.learner.textGuest");

  return (
    <div className="space-y-10 overflow-hidden">
      <section
        data-aos="fade-up"
        className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,118,110,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_46%,_#eef6ff_100%)] px-5 py-8 shadow-[0_32px_120px_rgba(37,99,235,0.10)] dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(135deg,_#020617_0%,_#0f172a_48%,_#082f49_100%)] sm:px-8 sm:py-10 lg:px-12"
      >
        <BeamGridBackground
          gridSize={28}
          gridColor="#d7e6f5"
          darkGridColor="#1e293b"
          beamColor="rgba(14,165,233,0.7)"
          darkBeamColor="rgba(56,189,248,0.85)"
          asBackground={true}
          beamCount={5}
          extraBeamCount={2}
          beamThickness={3}
          beamGlow
          glowIntensity={32}
          idleSpeed={1}
          className="-z-1"
        />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <Link
              href="https://www.divlabs-tech.com"
              target="_blank"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            >
              {t("home.learner.learnMore")}
              <ChevronRight size={16} className="ml-2" />
            </Link>

            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
                <Sparkles size={14} className="mr-2" />
                {t("home.learner.eyebrow")}
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {welcomeTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                {welcomeText}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={loadingTarget !== null}
                onClick={() =>
                  handleNavigate(isAuthenticated ? "/my_courses" : "/signin")
                }
                className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticated ? t("nav.myCourses") : t("nav.signIn")}
                <ArrowRight size={16} className="ml-2" />
              </button>

              <button
                type="button"
                disabled={loadingTarget !== null}
                onClick={() => handleNavigate("/available_courses")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/75 px-5 py-3 text-sm font-semibold text-slate-800 transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              >
                {t("home.learner.explore")}
                <PlayCircle size={16} className="ml-2" />
              </button>
            </div>

            <div className="flex min-h-[32px] items-center gap-3">
              <ClipLoader
                color="#0284c7"
                loading={loadingTarget !== null}
                size={22}
                aria-label="Navigation loading"
              />
              {loadingTarget ? (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("common.loading")}
                </p>
              ) : null}
            </div>
          </div>

          <div
            data-aos="zoom-in"
            data-aos-delay="120"
            className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
          >
            <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("home.learner.featuredCourses")}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                {featuredStats.totalCourses}
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("home.learner.activeDomains")}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                {featuredStats.totalDomains}
              </p>
            </div>
            <div className="rounded-3xl border border-white/60 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("home.learner.freeCourses")}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                {featuredStats.totalFreeCourses}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickActionCard
          icon={<BookOpen size={20} />}
          title="Parcours clairs"
          description="Retrouvez rapidement les formations en cours, à venir et les détails de chaque session."
          delay={0}
        />
        <QuickActionCard
          icon={<Globe size={20} />}
          title="Accès flexible"
          description="Participez depuis n'importe quel appareil avec une navigation plus fluide entre catalogue et détail."
          delay={80}
        />
        <QuickActionCard
          icon={<Shield size={20} />}
          title="Formateurs vérifiés"
          description="Les contenus mis en avant restent rattachés à des profils identifiés et consultables."
          delay={160}
        />
      </section>

      <section
        data-aos="fade-up"
        data-aos-delay="120"
        className="rounded-[32px] border border-slate-200 bg-white px-4 py-6 shadow-[0_20px_80px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:px-6"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
              {t("home.learner.selection")}
            </p>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              {t("home.learner.popularCourses")}
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
            {t("home.learner.popularText")}
          </p>
        </div>

        {rankedCourses.length > 0 ? (
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <ClipLoader color="#0284c7" loading={true} size={36} />
              </div>
            }
          >
            <BentoGrid data={rankedCourses} className="" />
          </Suspense>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {t("home.learner.emptyPopular")}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home({
  session,
  initialRankedCourses,
  initialTrainerFormation,
}: Props) {
  const { locale, t } = useLocale();
  const rankedCourses = initialRankedCourses || [];
  const trainerData = initialTrainerFormation || {
    totalFormations: 0,
    totalPurchases: 0,
    participantsByMonth: [],
    revenueByMonth: [],
    locations: [],
    formationsByMonth: [],
    trainerCourses: [],
  };

  const trainerCourses = trainerData.trainerCourses || [];
  const trainerDerived = {
    totalRevenue: trainerData.revenueByMonth.reduce(
      (sum, item) => sum + item.revenue,
      0,
    ),
    activeCourses: trainerCourses.filter((course) => course.state === "started").length,
    upcomingCourses: trainerCourses.filter((course) => course.state === "upcoming").length,
  };

  if (session?.user.role === "trainer") {
    return (
      <div className="space-y-6">
        <section className="dashboard-panel dashboard-grid-background relative overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
          <BeamGridBackground
            gridSize={30}
            gridColor="#dbeafe"
            darkGridColor="#1e293b"
            beamColor="rgba(14,165,233,0.7)"
            darkBeamColor="rgba(14,165,233,0.9)"
            asBackground={true}
            beamCount={4}
            extraBeamCount={1}
            beamThickness={3}
            beamGlow
            glowIntensity={26}
            idleSpeed={1}
            className="-z-1"
          />

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.35fr_0.9fr] xl:items-end">
            <div>
              <span className="dashboard-stat-chip">{t("home.trainer.heroEyebrow")}</span>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {t("home.trainer.heroTitle")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                {t("home.trainer.heroText")}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/launch_courses"
                  className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5"
                >
                  {t("home.trainer.heroPrimary")}
                  <Rocket className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/courses_state"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
                >
                  {t("home.trainer.heroSecondary")}
                  <LineChart className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="dashboard-subpanel p-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Wallet className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("home.trainer.heroTotalRevenue")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {formatCurrencyAmount(trainerDerived.totalRevenue, locale)}
                </p>
              </div>
              <div className="dashboard-subpanel p-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("home.trainer.heroActiveCourses")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {trainerDerived.activeCourses}
                </p>
              </div>
              <div className="dashboard-subpanel p-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {t("home.trainer.heroUpcomingCourses")}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {trainerDerived.upcomingCourses}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12">
            <EcommerceMetrics
              totalFormations={trainerData.totalFormations}
              totalPurchases={trainerData.totalPurchases}
              activeCourses={trainerDerived.activeCourses}
              upcomingCourses={trainerDerived.upcomingCourses}
            />
          </div>

          <div className="col-span-12 space-y-6 xl:col-span-7">
            <MonthlySalesChart
              participantsByMonth={trainerData.participantsByMonth}
            />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget revenueByMonth={trainerData.revenueByMonth} />
          </div>

          <div className="col-span-12">
            <StatisticsChart
              participantsByMonth={trainerData.participantsByMonth}
              revenueByMonth={trainerData.revenueByMonth}
              formationsByMonth={trainerData.formationsByMonth}
            />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DemographicCard locations={trainerData.locations} />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <RecentOrders trainerFormation={trainerCourses} />
          </div>
        </div>
      </div>
    );
  }

  return <LearnerHome session={session} rankedCourses={rankedCourses} />;
}
