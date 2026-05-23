type SocialMedia = {
    id: string,
    name: string,
    link: string,
}

type Trainer = {
    id?: string,
    userId?: string,
    profession?: string,
    country?: string,
    domain?: string,
    justification?: string,
    justificatifDocument?: string,
    identificationPiece?: string,
    valid?: boolean,
    reject?: boolean,
    rejectReason?: string,
}

export type User = {
    id: string;
    name: string;
    surname: string;
    password?: string | null;
    email: string;
    emailVerified: Date;
    image?: string | null;
    socialMedias: SocialMedia[];
    location?: string | null;
    trainer?: Trainer | null;
    phone?: string | number | null;
    bio?: string | null;
    post?: string | null;
    role: string;
    createdAt: Date;
    connected: boolean;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    sex?: string | null;
    provider?: string | null;
}

export default async function getUserInfo(userId: string): Promise<User> {
    try {
        const res = await fetch(`/api/getUserInfo?userId=${encodeURIComponent(userId)}`);

        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

        const data = await res.json();

        if (data.success && data.data) {
            const user = data.data as User;

            // Convert possible ISO date strings to Date objects
            if (user.emailVerified) {
                user.emailVerified = new Date(user.emailVerified as any);
            } else {
                user.emailVerified = new Date();
            }

            if (user.createdAt) {
                user.createdAt = new Date(user.createdAt as any);
            } else {
                user.createdAt = new Date();
            }

            return user;
        }

        throw new Error("Données invalides");
    } catch (err: any) {
        console.error("Erreur lors de la récupération des informations utilisateur :", err?.message ?? err);
        throw err;
    }
}           
