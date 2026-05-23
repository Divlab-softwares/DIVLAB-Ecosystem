"use client";

import { RefreshCw } from "lucide-react";

type RefreshButtonProps = {
  isRefreshing?: boolean;
  onRefresh: () => void;
  label?: string;
};

export default function RefreshButton({
  isRefreshing = false,
  onRefresh,
  label = "Rafraichir",
}: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isRefreshing}
      title={label}
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-700"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
