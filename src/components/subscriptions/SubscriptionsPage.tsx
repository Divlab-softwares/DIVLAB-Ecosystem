"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ban, MessageCircle, ShieldX, UserRoundCheck } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

type ApiSubscription = {
  id: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    surname?: string | null;
    email: string;
    image?: string | null;
    country?: string | null;
    city?: string | null;
  };
  trainer?: {
    id: string;
    userId: string;
    profession?: string | null;
    domain?: string | null;
    user: {
      id: string;
      name: string;
      surname?: string | null;
      email: string;
      image?: string | null;
      country?: string | null;
      city?: string | null;
    };
  };
};

type ApiResponse = {
  role: "trainer" | "user";
  subscriptions: ApiSubscription[];
  subscribers?: ApiSubscription[];
};

function displayName(user?: { name: string; surname?: string | null }) {
  return `${user?.name ?? ""} ${user?.surname ?? ""}`.trim() || "Utilisateur";
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isTrainer = data?.role === "trainer";

  async function loadSubscriptions() {
    setLoading(true);
    const response = await fetch("/api/subscriptions", { cache: "no-store" });
    const payload = await response.json();
    setData(payload);
    setLoading(false);
  }

  useEffect(() => {
    void loadSubscriptions();
  }, []);

  async function unsubscribe(trainerId: string) {
    setBusyId(trainerId);
    await fetch("/api/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId }),
    });
    await loadSubscriptions();
    setBusyId(null);
  }

  async function moderate(subscriptionId: string, action: "ban" | "blacklist") {
    setBusyId(subscriptionId);
    await fetch("/api/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, action }),
    });
    await loadSubscriptions();
    setBusyId(null);
  }

  const renderSubscriptionCard = (
    subscription: ApiSubscription,
    mode: "subscriber" | "following",
  ) => {
    const person =
      mode === "subscriber" ? subscription.user : subscription.trainer?.user;
    const trainerId = subscription.trainer?.userId;
    const imageSrc = resolvePublicImage(person?.image, "images", DEFAULT_PROFILE_IMAGE);

    return (
      <article
        key={`${mode}-${subscription.id}`}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-theme-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start gap-4">
          <Image
            width={64}
            height={64}
            src={imageSrc}
            alt={displayName(person)}
            unoptimized={shouldBypassNextImageCache(imageSrc)}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
              {displayName(person)}
            </h2>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {person?.email}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
              Depuis {new Intl.DateTimeFormat("fr-FR").format(new Date(subscription.createdAt))}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Link
            href="/messages"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/[0.03]"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Link>

          {mode === "subscriber" ? (
            <>
              <button
                type="button"
                disabled={busyId === subscription.id}
                onClick={() => moderate(subscription.id, "ban")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-500/10"
              >
                <Ban className="h-4 w-4" />
                Bannir
              </button>
              <button
                type="button"
                disabled={busyId === subscription.id}
                onClick={() => moderate(subscription.id, "blacklist")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                <ShieldX className="h-4 w-4" />
                Blacklister
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!trainerId || busyId === trainerId}
              onClick={() => trainerId && unsubscribe(trainerId)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-500/10 sm:col-span-2"
            >
              <Ban className="h-4 w-4" />
              Se désabonner
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={isTrainer ? "Mes abonnés" : "Mes abonnements"} />

      <div className="dashboard-panel p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            <UserRoundCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {isTrainer ? "Audience abonnée" : "Formateurs suivis"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isTrainer
                ? "Bannissez un abonné ou bloquez définitivement une réinscription."
                : "Retrouvez vos formateurs et désabonnez-vous en un clic."}
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Chargement...</p>
        ) : (data?.subscriptions.length ?? 0) === 0 && (data?.subscribers?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Aucun abonnement actif pour le moment.
          </div>
        ) : (
          <div className="space-y-8">
            {isTrainer && (data?.subscribers?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
                  Abonnés à mon profil
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {data?.subscribers?.map((subscription) =>
                    renderSubscriptionCard(subscription, "subscriber"),
                  )}
                </div>
              </section>
            )}

            {(data?.subscriptions.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
                  Mes formateurs suivis
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {data?.subscriptions.map((subscription) =>
                    renderSubscriptionCard(subscription, "following"),
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
