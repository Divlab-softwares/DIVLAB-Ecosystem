"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { formatCurrencyAmount } from "@/lib/i18n";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type RevenueByMonth = {
  month: string;
  revenue: number;
}[];

type Props = {
  revenueByMonth: RevenueByMonth;
};

export default function MonthlyTarget({ revenueByMonth }: Props) {
  const { locale, t } = useLocale();

  const metrics = useMemo(() => {
    const values = revenueByMonth.map((item) => item.revenue);
    const bestMonth = values.length ? Math.max(...values) : 0;
    const currentMonth = values.length ? values[values.length - 1] : 0;
    const target = bestMonth > 0 ? Math.round(bestMonth * 1.1) : 0;
    const progress = target > 0 ? Math.min((currentMonth / target) * 100, 100) : 0;

    return {
      bestMonth,
      currentMonth,
      target,
      progress: Number(progress.toFixed(1)),
    };
  }, [revenueByMonth]);

  const series = [metrics.progress];
  const options: ApexOptions = {
    colors: ["#0ea5e9"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 300,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -95,
        endAngle: 95,
        hollow: {
          size: "74%",
        },
        track: {
          background: "#e2e8f0",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "30px",
            fontWeight: "700",
            color: "#0f172a",
            offsetY: -8,
            formatter: (val) => `${Math.round(val)}%`,
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    labels: [t("stats.target")],
  };

  return (
    <div className="dashboard-panel dashboard-grid-background overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("stats.revenueTarget")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {t("stats.revenueTargetText")}
          </p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <TrendingUp className="h-5 w-5" />
        </span>
      </div>

      <div className="relative mt-4">
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={300}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="dashboard-subpanel p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("stats.currentMonth")}
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
            {formatCurrencyAmount(metrics.currentMonth, locale)}
          </p>
        </div>
        <div className="dashboard-subpanel p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("stats.bestMonth")}
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
            {formatCurrencyAmount(metrics.bestMonth, locale)}
          </p>
        </div>
        <div className="dashboard-subpanel p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            {t("stats.target")}
          </p>
          <p className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
            {formatCurrencyAmount(metrics.target, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
