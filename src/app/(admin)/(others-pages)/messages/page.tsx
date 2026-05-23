import type { Metadata } from "next";

import MessagesPage from "@/components/messages/MessagesPage";

export const metadata: Metadata = {
  title: "Messages | DIVLAB Training",
  description: "Messagerie directe entre formateurs et abonnes.",
};

export default function Page() {
  return <MessagesPage />;
}
