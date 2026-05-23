"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { Locale } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();


  // Fonction de bascule sécurisée pour TypeScript
  const toggleLocale = () => {
    const newLocale: Locale = locale === "fr" ? "en" : "fr";
    setLocale(newLocale);
  };
  // Style commun pour les boutons pour éviter la répétition
  const getButtonStyles = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${active
      ? "bg-sky-600 text-white shadow-sm"
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 p-1 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900/80">

      {/* VERSION DESKTOP : Sélecteur double */}
      <div className="hidden lg:flex items-center gap-1">
        <span className="flex h-8 w-8 items-center justify-center text-gray-500 dark:text-gray-300">
          <Languages className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={() => setLocale("fr")}
          className={getButtonStyles(locale === "fr")}
          title={t("common.french")}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={getButtonStyles(locale === "en")}
          title={t("common.english")}
        >
          EN
        </button>
      </div>

      {/* VERSION MOBILE : Un seul bouton bouton toggle explicite */}
      <button
        type="button"
        onClick={toggleLocale}
        className={`${getButtonStyles(true)} lg:hidden flex items-center gap-2 px-2`}
        title={t("common.switchLanguage")}
      >
        <Languages className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

    </div>
  );
}
