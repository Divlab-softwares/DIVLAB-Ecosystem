"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useLocale } from "@/context/LocaleContext";
import { formatMonthLabel } from "@/lib/i18n";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type ParticipantsByMonth = {
  month: string;
  participants: number;
}[]

type props = {
  participantsByMonth: ParticipantsByMonth;
}

export default function MonthlySalesChart({ participantsByMonth }: props) {
  const { locale, t } = useLocale();
  const mappedData = useMemo(() => {
    const byMonth = new Map(
      participantsByMonth.map((item) => [item.month, item.participants]),
    );
    const now = new Date();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), index, 1);
      const key = `${date.getFullYear()}-${String(index + 1).padStart(2, "0")}`;
      return {
        label: formatMonthLabel(key, locale),
        value: byMonth.get(key) ?? 0,
      };
    });
  }, [locale, participantsByMonth]);

  const options: ApexOptions = {
    colors: ["#0ea5e9"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 260,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 12,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        ...mappedData.map((item) => item.label),
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const series = [
    {
      name: t("stats.participants"),
      data: mappedData.map((item) => item.value),
    },
  ];

  return (
    <div className="dashboard-panel overflow-hidden px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t("stats.audienceByMonth")}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {t("stats.audienceByMonthText")}
          </p>
        </div>
        <span className="dashboard-stat-chip">{t("courses.connectedToDb")}</span>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-3 min-w-[650px] pl-1 xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={260}
          />
        </div>
      </div>
    </div>
  );
}
