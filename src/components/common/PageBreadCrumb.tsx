"use client";

import Link from "next/link";
import React from "react";
import { useLocale } from "@/context/LocaleContext";

type SubTitle = {
  path: string;
  title: string;
}
interface BreadcrumbProps {
  pageTitle: string;
  subTitles?: SubTitle[];
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, subTitles }) => {
  const { t } = useLocale();

  return (
    <div className="dashboard-panel dashboard-grid-background relative z-10 mb-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden px-5 py-5">
      <div className="space-y-2">
        <span className="dashboard-stat-chip">{t("common.dashboard")}</span>
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-white/95">
          {pageTitle}
        </h2>
      </div>
      <nav>
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-600 shadow-theme-xs transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
              href="/"
            >
              {t("common.home")}
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </li>

          {subTitles && subTitles.map((subTitle, index) => (
            <li key={index}>
              <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-slate-600 shadow-theme-xs transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
                href={"/" + subTitle.path}
              >
                <span className="text-sm text-slate-800 dark:text-white/90">
                  {subTitle.title}
                </span>
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
          <li className="inline-flex items-center rounded-full bg-slate-950 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
