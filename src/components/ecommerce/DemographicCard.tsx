"use client";

import Image from "next/image";
import countries from "world-countries";
import CountryMap from "./CountryMap";
import { useLocale } from "@/context/LocaleContext";

type Location = {
  location: string;
  count: number;
  percentage: number;
}[];

type Props = {
  locations: Location;
};

function getCountryCode(countryName: string) {
  const foundCountry = countries.find((country) => country.name.common === countryName);
  return foundCountry?.cca2?.toLowerCase() || "us";
}

export default function DemographicCard({ locations }: Props) {
  const { t } = useLocale();

  return (
    <div className="dashboard-panel p-5 sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("stats.demography")}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          {t("stats.demographyText")}
        </p>
      </div>

      <div className="dashboard-subpanel my-6 overflow-hidden px-4 py-6 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-[212px] w-[252px] 2xsm:w-[307px] xsm:w-[358px] sm:-mx-6 md:w-[668px] lg:w-[634px] xl:w-[393px] 2xl:w-[554px]"
        >
          <CountryMap locations={locations} />
        </div>
      </div>

      <div className="space-y-4">
        {locations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300">
            {t("stats.noData")}
          </div>
        ) : (
          locations.map((locationData, index) => (
            <div
              key={`${locationData.location}-${index}`}
              className="dashboard-subpanel flex items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-full max-w-8 overflow-hidden rounded-full">
                  <Image
                    width={48}
                    height={48}
                    src={`https://flagcdn.com/${getCountryCode(locationData.location)}.svg`}
                    alt={locationData.location}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {locationData.location}
                  </p>
                  <span className="block text-xs text-slate-500 dark:text-slate-300">
                    {locationData.count} {t("stats.learners").toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="flex w-full max-w-[150px] items-center gap-3">
                <div className="relative block h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-sky-500"
                    style={{ width: `${locationData.percentage}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {locationData.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
