import type { Metadata } from "next";

import SubscriptionsPage from "@/components/subscriptions/SubscriptionsPage";

export const metadata: Metadata = {
  title: "Abonnements | DIVLAB Training",
  description: "Gestion des abonnements et des abonnes formateur.",
};

export default function Page() {
  return <SubscriptionsPage />;
}
