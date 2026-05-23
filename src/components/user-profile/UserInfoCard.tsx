"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { PencilIcon } from "lucide-react";

import { User } from "@@/lib/getUserInfoLib";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Notification from "@/components/notification/Notification";

type props = {
  user: User | null;
  modifiable: boolean;
  setUser: (updates: Partial<User>) => void;
};

export default function UserInfoCard({ user, setUser, modifiable }: props) {
  const { t } = useLocale();
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();
  const { update } = useSession();
  const { handleUser, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [post, setPost] = useState(user?.role == "trainer" ? (user?.trainer?.profession || "") : (user?.post || ""));
  const [surname, setSurname] = useState(user?.surname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone?.toString() || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [sex, setSex] = useState(user?.sex || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setPost(user?.post || "");
    setSurname(user?.surname || "");
    setEmail(user?.email || "");
    setPhone(user?.phone?.toString() || "");
    setBio(user?.bio || "");
    setSex(user?.sex || "");
  }, [user]);

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
    form.append("name", name.trim());
    form.append("email", email.trim());
    form.append("surname", surname.trim());
    form.append("bio", bio.trim());
    form.append("phone", phone.trim());
    form.append("post", post.trim());
    form.append("sex", sex.trim());

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

  return (
    <>
      <div className="dashboard-panel p-5 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white lg:mb-6">
              {t("profile.personalInfo")}
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-slate-500 dark:text-slate-400">
                  {t("profile.name")}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white/90">
                  {name || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-slate-500 dark:text-slate-400">
                  {t("profile.surname")}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white/90">
                  {surname || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.email")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {email || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.phone")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {phone || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.bio")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {bio || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.profession")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {post || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {t("profile.sex")}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {sex || "-"}
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

          <div className="fixed bottom-2 right-2 flex flex-col items-center justify-center">
            <ClipLoader
              color="#36d7b7"
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>

          {success && (
            <Notification state="success" title="Opération réussie" message={success} />
          )}
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("common.edit")} {t("profile.personalInfo").toLowerCase()}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour votre profil sans perdre votre session active.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-2">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Informations personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom</Label>
                    <Input
                      type="text"
                      defaultValue={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Prénom</Label>
                    <Input
                      type="text"
                      defaultValue={surname}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Adresse email</Label>
                    <Input
                      type="text"
                      defaultValue={email}
                      disabled
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Téléphone</Label>
                    <Input
                      type="text"
                      defaultValue={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input
                      type="text"
                      placeholder="Je suis un fin professionnel en sciences humaines..."
                      defaultValue={bio}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Profession</Label>
                    <Input
                      type="text"
                      defaultValue={post}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPost(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Sexe</Label>
                    <Input
                      type="text"
                      placeholder="Homme / Femme / Autre"
                      defaultValue={sex}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSex(e.target.value)}
                    />
                  </div>
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
