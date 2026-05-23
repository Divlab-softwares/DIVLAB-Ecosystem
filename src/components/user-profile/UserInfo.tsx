"use client";

import React, { useEffect, useState } from "react";

import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserTrainerInfo from "@/components/user-profile/UserTrainerInfo";
import SubscriptionButton from "@/components/subscriptions/SubscriptionButton";
import { useLocale } from "@/context/LocaleContext";
import getUserInfo, { User } from "@@/lib/getUserInfoLib";
import { useAuth } from "@/context/AuthContext";

interface props {
    trainerId?: string;
}

export default function UserInfo({ trainerId }: props) {
    const { t } = useLocale();
    const { user: authUser, handleUser: handleAuthUser, loading: authLoading } = useAuth();
    const [localUser, setLocalUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = !trainerId || trainerId === authUser?.id;

    async function fetchUser(targetTrainerId: string) {
        setLoading(true);

        try {
            const data = await getUserInfo(targetTrainerId);
            setLocalUser(data);
        } catch (error) {
            console.error("Erreur lors du chargement du profil :", error);
            setLocalUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isOwnProfile) {
            if (authUser) {
                setLocalUser(authUser);
                setLoading(false);
                return;
            }

            if (!authLoading) {
                setLocalUser(null);
                setLoading(false);
            }

            return;
        }

        if (trainerId) {
            void fetchUser(trainerId);
        }
    }, [authLoading, authUser, isOwnProfile, trainerId]);

    if (loading) {
        return <p className="text-sm text-slate-500 dark:text-slate-300">{t("profile.loading")}</p>;
    }

    const updateFunc = (updates: Partial<User>) => {
        setLocalUser((previousUser) => (previousUser ? { ...previousUser, ...updates } : previousUser));

        if (isOwnProfile) {
            handleAuthUser(updates);
        }
    };

    return (
        <div>
            <div className="space-y-6">
                <UserMetaCard user={localUser} setUser={updateFunc} modifiable={!trainerId} />
                {trainerId && localUser?.trainer?.valid && (
                    <div className="dashboard-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                Abonnement formateur
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Abonnez-vous pour débloquer la messagerie directe avec ce formateur.
                            </p>
                        </div>
                        <SubscriptionButton trainerId={trainerId} className="sm:w-auto" />
                    </div>
                )}
                <UserInfoCard user={localUser} setUser={updateFunc} modifiable={!trainerId} />
                <UserAddressCard user={localUser} setUser={updateFunc} modifiable={!trainerId} />
                {!trainerId && <UserTrainerInfo initialUser={localUser} />}
            </div>
        </div>
    );
}
