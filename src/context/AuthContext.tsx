'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { User } from "@@/lib/getUserInfoLib";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => void;
    handleUser: (updates: Partial<User>) => void;
    refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshUser = useCallback(async () => {
        if (!session?.user?.id) {
            setUser(null);
            return null;
        }

        setIsRefreshing(true);

        try {
            const res = await fetch("/api/user/profile", {
                cache: "no-store",
                credentials: "same-origin",
            });

            if (res.status === 401) {
                setUser(null);
                return null;
            }

            if (!res.ok) {
                throw new Error(`Erreur HTTP ${res.status}`);
            }

            const data = await res.json();

            if (data.success && data.data) {
                setUser(data.data);
                return data.data as User;
            }

            throw new Error("Données invalides");
        } catch (err: string | any) {
            console.error(
                "Erreur lors de la récupération du profil utilisateur :",
                err?.message ?? err,
            );
            return null;
        } finally {
            setIsRefreshing(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        if (status === "loading") {
            return;
        }

        if (!session?.user?.id) {
            setUser(null);
            return;
        }

        void refreshUser();
    }, [refreshUser, session?.user?.id, status]);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const handleUser = useCallback((updates: Partial<User>) => {
        setUser((currentUser) => (currentUser ? { ...currentUser, ...updates } : currentUser));
    }, []);

    const value = useMemo(() => ({
        user,
        loading: status === "loading" || isRefreshing,
        logout,
        handleUser,
        refreshUser,
    }), [handleUser, isRefreshing, logout, refreshUser, status, user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
