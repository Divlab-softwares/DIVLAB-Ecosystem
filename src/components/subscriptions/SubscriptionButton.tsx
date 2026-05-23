"use client";

import { useEffect, useState } from "react";
import { BellPlus, BellOff, Loader2 } from "lucide-react";

type Props = {
  trainerId: string;
  className?: string;
};

type SubscriptionState = "loading" | "none" | "active" | "banned" | "blacklisted" | "missing";

export default function SubscriptionButton({ trainerId, className = "" }: Props) {
  const [state, setState] = useState<SubscriptionState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!trainerId) {
      setState("missing");
      return;
    }

    let mounted = true;

    fetch(`/api/subscriptions?trainerId=${encodeURIComponent(trainerId)}`, {
      cache: "no-store",
    })
      .then((response) => {
        if (response.status === 401) {
          return { status: "none" };
        }

        return response.json();
      })
      .then((data) => {
        if (mounted) {
          setState((data.status ?? "none") as SubscriptionState);
        }
      })
      .catch(() => {
        if (mounted) {
          setState("none");
        }
      });

    return () => {
      mounted = false;
    };
  }, [trainerId]);

  async function toggleSubscription() {
    setBusy(true);
    setError("");

    const isSubscribed = state === "active";
    const response = await fetch("/api/subscriptions", {
      method: isSubscribed ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Opération impossible.");
      setBusy(false);
      return;
    }

    setState(isSubscribed ? "none" : "active");
    setBusy(false);
  }

  const disabled = busy || state === "loading" || state === "blacklisted" || state === "missing";
  const subscribed = state === "active";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleSubscription}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          subscribed
            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            : "bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700"
        }`}
      >
        {busy || state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : subscribed ? (
          <BellOff className="h-4 w-4" />
        ) : (
          <BellPlus className="h-4 w-4" />
        )}
        {state === "blacklisted"
          ? "Abonnement bloqué"
          : subscribed
            ? "Se désabonner"
            : "S'abonner"}
      </button>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
