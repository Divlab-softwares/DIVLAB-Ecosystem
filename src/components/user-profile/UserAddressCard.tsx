"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PencilIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

import { User } from "@@/lib/getUserInfoLib";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Notification from "@/components/notification/Notification";
import Select from '../form/Select';
import countries from "world-countries";
import ReactFlagsSelect from "react-flags-select";
import { City } from "country-state-city"; // Import des données

type props = {
  user: User | null;
  modifiable: boolean;
  setUser: (updates: Partial<User>) => void;
};

export default function UserAddressCard({ setUser, user, modifiable }: props) {
  const { t } = useLocale();
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();
  const { update } = useSession();
  const { handleUser, refreshUser } = useAuth();

  const [country, setCountry] = useState(user?.country || "");
  const [countryCode, setCountryCode] = useState("");
  const [city, setCity] = useState(user?.city || "");
  const [postalCode, setPostalCode] = useState(user?.postalCode || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cities = useMemo(() => {
    if (!countryCode) return [];
    const data = City.getCitiesOfCountry(countryCode);
    return data ? data.map(c => ({ value: c.name, label: c.name })) : [];
  }, [countryCode]);



  useEffect(() => {
    if (user) {
      // 1. Initialisation directe des champs simples
      setCountry(user.country || "");
      setCity(user.city || "");
      setPostalCode(user.postalCode || "");

      // 2. Recherche optimisée du code pays (find est plus rapide que forEach)
      const foundCountry = countries.find(c => c.name.common === user.country);
      if (foundCountry) {
        setCountryCode(foundCountry.cca2);
      }
    }
  }, [user, countries]); // Ajoutez countries en dépendance si la liste est chargée dynamiquement


  const syncProfile = async (nextUser: User | null) => {
    if (!nextUser) {
      return;
    }

    setUser(nextUser);
    handleUser(nextUser);
    await update();
    await refreshUser();
    router.refresh();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("userId", user?.id || "");
    form.append("country", country.trim());
    form.append("postalCode", postalCode.trim());
    form.append("city", city.trim());

    try {
      const res = await fetch(`/api/setUserInfo?userId=${user?.id || "ignore"}`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setTimeout(() => setError(""), 5000);
        return;
      }

      await syncProfile(data.new_user ?? null);
      setSuccess("Opération réussie");
      setTimeout(() => setSuccess(""), 4000);

    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Une erreur est survenue.",
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
      closeModal();
    }
  };


  const customSingleValue = ({ data }: any) => (
    <div className="flex items-center gap-2">
      <img
        src={`https://flagcdn.com{data.value.toLowerCase()}.png`}
        width="20"
        alt=""
      />
      <span>{data.label}</span>
    </div>
  );

  const handleSelect = (code: string) => {
    // 1. On met à jour le code pays et on vide les viles pour un nouveau pays
    setCountryCode(code);
    setCity("")
    // 2. On cherche le nom correspondant dans ta liste world-countries
    const selectedCountry = countries.find((c) => c.cca2 === code);

    if (selectedCountry) {
      setCountry(selectedCountry.name.common);
    }
  };

  return (
    <>
      <div className="dashboard-panel p-5 lg:p-6">
        <div className=" flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white lg:mb-6">
              {t("profile.address")}
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.country")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {country || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.city")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {city || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.postalCode")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {postalCode || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.userId")}
                </p>
                <p className="text-sm font-medium break-all text-gray-800 dark:text-white/90">
                  {user?.id || "-"}
                </p>
              </div>
            </div>
          </div>

          {modifiable && (
            <button
              onClick={openModal}
              disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-theme-xs transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.03] lg:inline-flex lg:w-auto"
          >
            <PencilIcon className="h-4 w-4" />
              {t("common.edit")}
            </button>
          )}

          {error !== "" && (
            <Notification state="error" title="Erreur lors de l'opération" message={error} />
          )}



          {success && (
            <Notification state="success" title="Opération réussie" message={success} />
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-4 no-scrollbar dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("common.edit")} {t("profile.address").toLowerCase()}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Les changements sont sauvegardes puis resynchronises avec la session.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar overflow-y-auto px-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Pays</Label>
                  <ReactFlagsSelect
                    selected={countryCode} // Ton state "country" (ex: "FR")
                    onSelect={handleSelect}
                    searchable
                    placeholder="Choisir un pays"
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300  text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 "
                  />
                  {/* <Input
                    type="text"
                    defaultValue={country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
                  /> */}
                </div>

                <div>
                    <Label>Ville / État</Label>
                  {/* Sélecteur de Villes (Ton composant) */}
                  <Select
                    options={cities}
                    placeholder={country ? "Choisir une ville" : "Sélectionnez d'abord un pays"}
                    onChange={(value: string) => setCity(value)}
                    defaultValue={city}
                    className="flex-1"
                  />
                </div>

                <div>
                  <Label>Code postal</Label>
                  <Input
                    type="text"
                    defaultValue={postalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                  />
                </div>

                <div>
                  <Label>USER ID</Label>
                  <Input type="text" disabled defaultValue={user?.id || ""} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                {t("common.close")}
              </Button>
              <Button size="sm" type="submit" disabled={loading}>
                {t("common.save")}
              </Button>
            </div>
          </form>
          <div className="absolute bottom-2 left-2 flex flex-col items-center justify-center">
            <ClipLoader
              color="#36d7b7"
              loading={loading}
              size={30}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
