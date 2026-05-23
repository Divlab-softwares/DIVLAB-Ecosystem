import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@@/lib/prisma";
import { getUserProfileByEmail, getUserProfileById } from "@@/lib/userProfile";
import getSupabasePublicLink from "./getSupabasePublicLink";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            name?: string | null;
            surname?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            provider?: string | null;
        };
    }

    interface User {
        id: string;
        role?: string;
        surname?: string | null;
        provider?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        provider?: string | null;
        picture?: string | null;
        surname?: string | null;
        app_role?: string;
    }
}

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const domain = ".divlabs-tech.com";

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
const iss = `https://${projectRef}.supabase.co/auth/v1`;

async function markUserConnection(userId: string | undefined, connected: boolean) {
    if (!userId) {
        return;
    }

    await prisma.user.update({
        where: { id: userId },
        data: { connected },
    }).catch((error) => {
        console.error("Erreur lors de la mise a jour de l'etat de connexion :", error);
    });
}

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password,
                );

                if (!isPasswordValid) {
                    return null;
                }

                await markUserConnection(user.id, true);

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    surname: user.surname,
                    image: user.image ,
                    role: user.role,
                    provider: user.provider ?? "credentials",
                };
            },
        }),
    ],
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: useSecureCookies,
                domain: useSecureCookies ? domain : undefined,
            },
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 30,
        updateAge: 60 * 60 * 6,
    },
    jwt: {
        secret: process.env.SUPABASE_JWT_SECRET,
        maxAge: 60 * 60 * 24 * 30,
    },
    secret: process.env.SUPABASE_JWT_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) {
                return false;
            }

            const existingUser = await getUserProfileByEmail(user.email);

            if (!existingUser) {
                return false;
            }

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    connected: true,
                    provider: account?.provider ?? existingUser.provider,
                    image: user.image ?? existingUser.image,
                    name: user.name ?? existingUser.name,
                    surname: user.surname ?? existingUser.surname,
                },
            });

            user.id = existingUser.id;
            user.role = existingUser.role;
            user.provider = account?.provider ?? existingUser.provider;
            user.surname = existingUser.surname;

            return true;
        },

        async jwt({ token, user, trigger }) {
            if (user?.id) {
                token.sub = user.id;
                token.id = user.id;
                token.role = user.role ?? token.role ?? "user";
                token.app_role = user.role ?? token.app_role ?? "user";
                token.provider = user.provider ?? token.provider ?? null;
                token.surname = user.surname ?? token.surname ?? null;
                token.name = user.name ?? token.name;
                token.email = user.email ?? token.email;
                token.picture = user.image ?? token.picture ?? null;
                token.aud = "authenticated";
            }

            if ((trigger === "update" || !token.role || !token.picture) && token.sub) {
                const dbUser = await getUserProfileById(token.sub);

                if (dbUser) {
                    token.role = dbUser.role;
                    token.app_role = dbUser.role;
                    token.provider = dbUser.provider ?? null;
                    token.surname = dbUser.surname ?? null;
                    token.name = dbUser.name ?? token.name;
                    token.email = dbUser.email ?? token.email;
                    token.picture = dbUser.image ?? token.picture ?? null;
                    token.aud = "authenticated";
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (!token.sub) {
                return session;
            }

            const dbUser = await getUserProfileById(token.sub);
            const resolvedRole = dbUser?.role ?? (token.role as string) ?? "user";

            session.user = {
                ...session.user,
                id: token.sub,
                name: dbUser?.name ?? token.name ?? session.user?.name ?? null,
                surname: dbUser?.surname ?? (token.surname as string | null) ?? null,
                email: dbUser?.email ?? token.email ?? session.user?.email ?? null,
                image: dbUser?.image ?? (token.picture as string | null) ?? session.user?.image ?? null,
                role: resolvedRole,
                provider: dbUser?.provider ?? (token.provider as string | null) ?? null,
            };

            session.accessToken = jwt.sign({
                sub: token.sub,
                email: session.user.email,
                role: "authenticated",
                aud: "authenticated",
                app_role: resolvedRole,
                iss,
            }, SUPABASE_JWT_SECRET, {
                expiresIn: "1h",
            });

            return session;
        },
    },
    events: {
        async signOut({ token }) {
            await markUserConnection(token?.sub, false);
        },
    },
    pages: {
        signIn: "/signin",
    },
} satisfies NextAuthOptions;
