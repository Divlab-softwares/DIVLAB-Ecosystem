"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    void import("aos").then(({ default: AOS }) => {
      AOS.init({
        duration: 700,
        easing: "ease-out-quart",
        once: true,
        offset: 60,
      });
    });
  }, []);

  useEffect(() => {
    void import("aos").then(({ default: AOS }) => {
      AOS.refresh();
    });
  }, [pathname]);

  return <>{children}</>;
}
