"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image"; // ou ton logo

export default function GlobalLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        // Dès que l'URL change, on lance l'animation
        setIsChanging(true);

        // On l'arrête après un court délai (ou quand le rendu est fini)
        const timer = setTimeout(() => setIsChanging(false), 800);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!isChanging) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 bg-blue-500 p-2 rounded-full shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative flex h-8 w-8 items-center justify-center">
                {/* Ton Logo avec une animation pulse ou spin */}
                <Image width={256} height={256} src="/images/logo/logo.jpg" alt="Loading" className="animate-pulse w-10 h-10 rounded-full" />
            </div>
            <span className="text-xs font-medium text-gray-300 pr-2">Chargement...</span>
        </div>
    );
}
