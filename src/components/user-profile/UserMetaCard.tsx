"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PencilIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

import { User } from "@@/lib/getUserInfoLib";
import getSupabasePublicLink from "@@/lib/getSupabasePublicLink";
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

const FALLBACK_PROFILE = "/images/user/user-profile2.png";

function getSocialLink(user: User | null, platform: string) {
  return user?.socialMedias.find((socialMedia) => socialMedia.name === platform)?.link || "";
}

function getProfilePath(user: User | null) {
  if (!user?.image) {
    return FALLBACK_PROFILE;
  }

  return getSupabasePublicLink(user.image, "images") ?? user.image;
}

function SocialLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const hasHref = href.trim().length > 0;

  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={hasHref ? href : undefined}
      aria-disabled={!hasHref}
      className={`flex h-11 min-w-11 items-center justify-center rounded-full border border-gray-300 px-3 text-sm font-semibold shadow-theme-xs transition ${hasHref
        ? "bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        : "cursor-not-allowed bg-gray-100 text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600"
        }`}
    >
      {label}
    </a>
  );
}

export default function UserMetaCard({ setUser, user, modifiable }: props) {
  const { t } = useLocale();
  const { isOpen, openModal, closeModal } = useModal();
  const router = useRouter();
  const { update } = useSession();
  const { handleUser, refreshUser } = useAuth();

  const [facebook, setFacebook] = useState(getSocialLink(user, "facebook"));
  const [instagram, setInstagram] = useState(getSocialLink(user, "instagram"));
  const [linkedIn, setLinkedIn] = useState(getSocialLink(user, "linkedIn"));
  const [x, setX] = useState(getSocialLink(user, "X"));
  const [profilePath, setProfilePath] = useState(getProfilePath(user));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [blobPreview, setBlobPreview] = useState<string | null>(null);

  useEffect(() => {
    setFacebook(getSocialLink(user, "facebook"));
    setInstagram(getSocialLink(user, "instagram"));
    setLinkedIn(getSocialLink(user, "linkedIn"));
    setX(getSocialLink(user, "X"));
    setProfilePath(getProfilePath(user));
  }, [user]);

  useEffect(() => {
    return () => {
      if (blobPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(blobPreview);
      }
    };
  }, [blobPreview]);

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
    form.append("socialMedias", JSON.stringify([
      { name: "facebook", link: facebook.trim() },
      { name: "instagram", link: instagram.trim() },
      { name: "linkedIn", link: linkedIn.trim() },
      { name: "X", link: x.trim() },
    ]));

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
      setSuccess("OpÃ©ration rÃ©ussie");
      setTimeout(() => setSuccess(""), 4000);
      closeModal();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Une erreur est survenue.",
      );
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpload = async (file: File) => {
    const currentProfilePath = getProfilePath(user);
    const preview = URL.createObjectURL(file);
    setBlobPreview(preview);
    setProfilePath(preview);
    setLoading(true);
    setError("");

    const form = new FormData();
    form.append("userId", user?.id || "");
    form.append("profile_image", file);

    try {
      const res = await fetch(`/api/setUserInfo?userId=${user?.id || "ignore"}`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setProfilePath(currentProfilePath);
        setError([data.error, data.details].filter(Boolean).join(" "));
        setTimeout(() => setError(""), 6000);
        return;
      }

      await syncProfile(data.new_user ?? null);
      setSuccess("Image de profil mise à jour");
      setTimeout(() => setSuccess(""), 4000);
    } catch (requestError) {
      setProfilePath(currentProfilePath);
      setError(
        requestError instanceof Error ? requestError.message : "Une erreur est survenue.",
      );
      setTimeout(() => setError(""), 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop lourd, il doit faire moins de 5 Mo.");
      setTimeout(() => setError(""), 5000);
      event.target.value = "";
      return;
    }

    void handleProfileUpload(file);
  };

  return (
    <>
      <div className="dashboard-panel p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <input
              id="file_upload"
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              className="hidden"
              disabled={!modifiable || loading}
            />
            <label
              htmlFor="file_upload"
              className={`relative h-20 w-20 rounded-full border-2 border-gray-200 shadow-[0_5px_20px_rgba(0,200,255,0.6)] dark:border-gray-800 ${modifiable ? "cursor-pointer" : "cursor-default"}`}
            >
              {modifiable && (
                <div className="absolute -bottom-1 -right-1 z-5 rounded-full bg-slate-300 p-2 transition-transform duration-300 hover:scale-110">
                  <PencilIcon className="h-5 w-5" />
                </div>
              )}
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  fill
                  src={profilePath || FALLBACK_PROFILE}
                  alt="user"
                  className="h-full w-full object-cover"
                />
              </div>
            </label>

            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name || "invite"} {user?.surname || ""} {user?.trainer?.valid ? "| Trainer" : ""}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.post || ""}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.country || "-"} / {user?.city || "-"}
                </p>
              </div>
            </div>

            <div className="order-2 flex grow items-center gap-2 xl:order-3 xl:justify-end">
              <SocialLink href={facebook} label="f" />
              <SocialLink href={x} label="X" />
              <SocialLink href={linkedIn} label="in" />
              <SocialLink href={instagram} label="IG" />
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
            <Notification state="error" title="Erreur lors de l'opÃ©ration" message={error} />
          )}
        </div>

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
          <Notification state="success" title="OpÃ©ration rÃ©ussie" message={success} />
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {t("common.edit")} {t("common.profile").toLowerCase()}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Gardez vos informations à jour.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Réseaux sociaux
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      defaultValue={facebook}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacebook(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>X</Label>
                    <Input
                      type="text"
                      defaultValue={x}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setX(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      defaultValue={linkedIn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkedIn(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      defaultValue={instagram}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstagram(e.target.value)}
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
