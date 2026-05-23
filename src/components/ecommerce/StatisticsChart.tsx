"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import { formatMonthLabel } from "@/lib/i18n";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ParticipantsByMonth = {
  month: string;
  participants: number;
}[];

type RevenueByMonth = {
  month: string;
  revenue: number;
}[];

type FormationsByMonth = {
  month: string;
  formations: number;
}[];

type Props = {
  participantsByMonth: ParticipantsByMonth;
  revenueByMonth: RevenueByMonth;
  formationsByMonth: FormationsByMonth;
};

function mapMonthlyData<T extends { month: string }>(
  list: T[],
  getValue: (item: T) => number,
  locale: "fr" | "en",
) {
  const values = new Map(list.map((item) => [item.month, getValue(item)]));
  const now = new Date();

  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), index, 1);
    const key = `${date.getFullYear()}-${String(index + 1).padStart(2, "0")}`;
    return {
      label: formatMonthLabel(key, locale),
      value: values.get(key) ?? 0,
    };
  });
}

export default function StatisticsChart({
  participantsByMonth,
  revenueByMonth,
  formationsByMonth,
}: Props) {
  const { locale, t } = useLocale();

  const participants = useMemo(
    () => mapMonthlyData(participantsByMonth, (item) => item.participants, locale),
    [locale, participantsByMonth],
  );
  const revenue = useMemo(
    () => mapMonthlyData(revenueByMonth, (item) => item.revenue, locale),
    [locale, revenueByMonth],
  );
  const formations = useMemo(
    () => mapMonthlyData(formationsByMonth, (item) => item.formations, locale),
    [formationsByMonth, locale],
  );

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
    },
    colors: ["#0ea5e9", "#14b8a6", "#0f172a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 330,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [3, 3, 3],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0.03,
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
    xaxis: {
      type: "category",
      categories: participants.map((item) => item.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#64748b"],
        },
      },
    },
  };

  const series = [
    {
      name: t("stats.participants"),
      data: participants.map((item) => item.value),
    },
    {
      name: t("stats.revenue"),
      data: revenue.map((item) => item.value),
    },
    {
      name: t("stats.formations"),
      data: formations.map((item) => item.value),
    },
  ];

  return (
    <div className="dashboard-panel overflow-hidden px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="mb-6 flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("stats.performanceTitle")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("stats.performanceText")}
        </p>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[900px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={330}
          />
        </div>
      </div>
    </div>
  );
}
