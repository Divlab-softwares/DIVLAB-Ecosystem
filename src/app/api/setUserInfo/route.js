export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";

import { prisma } from "@@/lib/prisma";
import { authOptions } from "@@/lib/authOption";
import { getUserProfileById } from "@@/lib/userProfile";

const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BASIC_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL;

const serviceRoleKey =
    process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL);
console.log("Service Role Key length:", process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY?.length);

const supabase = createClient(supabaseUrl, serviceRoleKey);

const IMAGE_BUCKET = "images";
const DOCUMENT_BUCKET = "documents";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function getStringValue(value) {
    return typeof value === "string" ? value.trim() : null;
}

function getOptionalString(value) {
    return typeof value === "string" ? value : null;
}

function isProvidedFile(value) {
    return value instanceof File && value.size > 0;
}

function validateFile(file, label) {
    if (!isProvidedFile(file)) {
        return `${label} manquant.`;
    }

    if (file.size > MAX_FILE_SIZE) {
        return `${label} trop lourd (${file.name}) : maximum 5 Mo.`;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return `${label} invalide (${file.name}) : formats acceptes JPG, PNG ou PDF.`;
    }

    return null;
}

async function uploadFile({
    bucket,
    userId,
    folder,
    label,
    file,
}) {
    console.log("Supabase URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL);
console.log("Service Role Key length:", process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY?.length);
    const validationError = validateFile(file, label);

    if (validationError) {
        return { error: validationError };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${label}_${Date.now()}_${slugify(file.name, { lower: true, strict: true })}`;
    const filePath = `${folder}/${userId}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
    });

    if (error) {
        console.error(`[upload:${label}]`, error);
        return {
            error: `Erreur lors de l'upload ${label.toLowerCase()}.`,
            details: error.message || error,
        };
    }

    return { path: filePath };
}

function parseSocialMedias(rawSocialMedias) {
    if (rawSocialMedias == null) {
        return undefined;
    }

    try {
        const parsed = JSON.parse(rawSocialMedias);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .map((item) => ({
                name: typeof item?.name === "string" ? item.name.trim() : "",
                link: typeof item?.link === "string" ? item.link.trim() : "",
            }))
            .filter((item) => item.name.length > 0);
    } catch (error) {
        console.error("Erreur de parsing socialMedias :", error);
        return null;
    }
}

function buildUserUpdateData(formData, existingUser, profileImagePath, socialMediasParsed) {
    const name = getOptionalString(formData.get("name"));
    const surname = getOptionalString(formData.get("surname"));
    const email = getOptionalString(formData.get("email"));
    const phone = getOptionalString(formData.get("phone"));
    const bio = getOptionalString(formData.get("bio"));
    const location = getOptionalString(formData.get("location"));
    const city = getOptionalString(formData.get("city"));
    const country = getOptionalString(formData.get("country"));
    const postalCode = getOptionalString(formData.get("postalCode"));
    const post = getOptionalString(formData.get("post"));
    const sex = getOptionalString(formData.get("sex"));

    return {
        name: name ?? existingUser.name,
        surname: surname ?? existingUser.surname,
        email: email ?? existingUser.email,
        phone: phone ?? existingUser.phone,
        bio: bio ?? existingUser.bio,
        location: location ?? existingUser.location,
        city: city ?? existingUser.city,
        country: country ?? existingUser.country,
        postalCode: postalCode ?? existingUser.postalCode,
        post: post ?? existingUser.post,
        sex: sex ?? existingUser.sex,
        image: profileImagePath ?? existingUser.image,
        ...(socialMediasParsed !== undefined
            ? {
                socialMedias: {
                    deleteMany: {},
                    ...(socialMediasParsed.length > 0
                        ? { create: socialMediasParsed }
                        : {}),
                },
            }
            : {}),
    };
}

function buildTrainerFieldErrors({
    profession,
    country,
    domain,
    justification,
    hasExistingIdDocument,
    hasExistingProofDocument,
    hasNewIdDocument,
    hasNewProofDocument,
}) {
    const fieldErrors = {};

    if (!profession) {
        fieldErrors.profession = "La profession est requise.";
    }

    if (!country) {
        fieldErrors.country = "Le pays ou la ville de residence est requis.";
    }

    if (!domain) {
        fieldErrors.domain = "Le domaine principal est requis.";
    }

    if (!justification) {
        fieldErrors.justification = "Le justificatif de competence est requis.";
    }

    if (!hasExistingIdDocument && !hasNewIdDocument) {
        fieldErrors.identificationPiece = "La piece d'identification est requise.";
    }

    if (!hasExistingProofDocument && !hasNewProofDocument) {
        fieldErrors.justificatifDocument = "Le document justificatif est requis.";
    }

    return fieldErrors;
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Connexion requise pour modifier votre profil." },
                { status: 401 },
            );
        }

        const formData = await req.formData();
        const sessionUserId = session.user.id;
        const targetUserId = getStringValue(formData.get("userId"));
        const trainerUserId = getStringValue(formData.get("trainerId"));
        const isTrainerWorkflow = Boolean(trainerUserId);

        if (targetUserId && targetUserId !== sessionUserId) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas modifier le profil d'un autre utilisateur." },
                { status: 403 },
            );
        }

        if (trainerUserId && trainerUserId !== sessionUserId) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas soumettre un dossier formateur pour un autre compte." },
                { status: 403 },
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: {
                trainer: true,
            },
        });

        if (!existingUser) {
            return NextResponse.json(
                { error: "Utilisateur introuvable." },
                { status: 404 },
            );
        }

        const profileImage = formData.get("profile_image");
        let profileImagePath = null;

        if (isProvidedFile(profileImage)) {
            const uploadResult = await uploadFile({
                bucket: IMAGE_BUCKET,
                userId: sessionUserId,
                folder: "profile",
                label: "PROFILE",
                file: profileImage,
            });

            if (uploadResult.error) {
                return NextResponse.json(uploadResult, { status: 400 });
            }

            profileImagePath = uploadResult.path;
        }

        if (isTrainerWorkflow) {
            const profession = getStringValue(formData.get("profession"));
            const country = getStringValue(formData.get("country"));
            const domain = getStringValue(formData.get("domain"));
            const justification = getStringValue(formData.get("justification"));
            const idImage = formData.get("ID_image");
            const proofImage = formData.get("proof_image");

            const fieldErrors = buildTrainerFieldErrors({
                profession,
                country,
                domain,
                justification,
                hasExistingIdDocument: Boolean(existingUser.trainer?.identificationPiece),
                hasExistingProofDocument: Boolean(existingUser.trainer?.justificatifDocument),
                hasNewIdDocument: isProvidedFile(idImage),
                hasNewProofDocument: isProvidedFile(proofImage),
            });

            if (Object.keys(fieldErrors).length > 0) {
                return NextResponse.json(
                    {
                        error: "Le dossier formateur est incomplet.",
                        fieldErrors,
                    },
                    { status: 400 },
                );
            }

            let idImagePath = existingUser.trainer?.identificationPiece ?? null;
            let proofImagePath = existingUser.trainer?.justificatifDocument ?? null;

            if (isProvidedFile(idImage)) {
                const uploadResult = await uploadFile({
                    bucket: DOCUMENT_BUCKET,
                    userId: sessionUserId,
                    folder: "trainer-identifications",
                    label: "ID",
                    file: idImage,
                });

                if (uploadResult.error) {
                    return NextResponse.json(uploadResult, { status: 400 });
                }

                idImagePath = uploadResult.path;
            }

            if (isProvidedFile(proofImage)) {
                const uploadResult = await uploadFile({
                    bucket: DOCUMENT_BUCKET,
                    userId: sessionUserId,
                    folder: "trainer-proofs",
                    label: "PROOF",
                    file: proofImage,
                });

                if (uploadResult.error) {
                    return NextResponse.json(uploadResult, { status: 400 });
                }

                proofImagePath = uploadResult.path;
            }

            if (!existingUser.trainer) {
                await prisma.trainer.create({
                    data: {
                        userId: sessionUserId,
                        profession,
                        country,
                        domain,
                        justification,
                        justificatifDocument: proofImagePath,
                        identificationPiece: idImagePath,
                    },
                });
            } else {
                await prisma.trainer.update({
                    where: { userId: sessionUserId },
                    data: {
                        profession,
                        country,
                        domain,
                        justification,
                        justificatifDocument: proofImagePath,
                        identificationPiece: idImagePath,
                    },
                });
            }
        } else {
            const rawSocialMedias = getOptionalString(formData.get("socialMedias"));
            const socialMediasParsed = parseSocialMedias(rawSocialMedias);

            if (socialMediasParsed === null) {
                return NextResponse.json(
                    { error: "Le format des reseaux sociaux est invalide." },
                    { status: 400 },
                );
            }

            await prisma.user.update({
                where: { id: sessionUserId },
                data: buildUserUpdateData(
                    formData,
                    existingUser,
                    profileImagePath,
                    socialMediasParsed,
                ),
            });
        }

        const updatedUser = await getUserProfileById(sessionUserId);

        return NextResponse.json({
            ok: true,
            new_user: updatedUser,
        });
    } catch (error) {
        console.error("Erreur lors de la mise a jour du profil :", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la mise a jour du profil." },
            { status: 500 },
        );
    }
}
