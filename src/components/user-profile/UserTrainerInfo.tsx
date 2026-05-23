"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, FileText, PencilIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

import { User } from "@@/lib/getUserInfoLib";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import FileInput from "../form/input/FileInput";
import Select from "../form/Select";
import Notification from "@/components/notification/Notification";

type StepKey = "identity" | "proof" | "documents";

const STEP_ORDER: StepKey[] = ["identity", "proof", "documents"];

const DOMAIN_OPTIONS = [
    { value: "Marketing", label: "Marketing" },
    { value: "Design", label: "Design" },
    { value: "Développement", label: "Développement" },
    { value: "Data", label: "Data" },
    { value: "Intelligence artificielle", label: "Intelligence artificielle" },
    { value: "Productivité", label: "Productivité" },
    { value: "Ventes", label: "Ventes" },
    { value: "Product Management", label: "Product Management" },
    { value: "Cybersécurité", label: "Cybersécurité" },
    { value: "Finance", label: "Finance" },
    { value: "RH", label: "Ressources humaines" },
    { value: "Cloud", label: "Cloud & DevOps" },
    { value: "Contenu", label: "Contenu & Média" },
    { value: "Juridique", label: "Juridique" }
];


function getFileName(path: string | null | undefined) {
    if (!path) {
        return "";
    }

    return path.split("/").pop() || path;
}

function getInitialStep(trainerExists: boolean): number {
    return trainerExists ? 1 : 0;
}

export default function UserTrainerInfo({ initialUser }: { initialUser: User | null }) {
    const { isOpen, openModal, closeModal } = useModal();
    const router = useRouter();
    const { refreshUser } = useAuth();

    const [user, setUser] = useState<User | null>(initialUser);
    const [currentStep, setCurrentStep] = useState(getInitialStep(Boolean(initialUser?.trainer)));
    const [profession, setProfession] = useState(initialUser?.post || "");
    const [country, setCountry] = useState(initialUser?.trainer?.country || initialUser?.country || "");
    const [domain, setDomain] = useState(initialUser?.trainer?.domain || "");
    const [justification, setJustification] = useState(initialUser?.trainer?.justification || "");
    const [idDocument, setIdDocument] = useState<File | null>(null);
    const [proofDocument, setProofDocument] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const idInputRef = useRef<HTMLInputElement>(null);
    const proofInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUser(initialUser);
        setProfession(initialUser?.trainer?.profession || "");
        setCountry(initialUser?.trainer?.country || initialUser?.country || "");
        setDomain(initialUser?.trainer?.domain || "");
        setJustification(initialUser?.trainer?.justification || "");
        setCurrentStep(getInitialStep(Boolean(initialUser?.trainer)));
    }, [initialUser]);

    const isValidated = Boolean(user?.trainer?.valid);
    const isRejected = Boolean(user?.trainer?.reject);
    const existingIdDocument = user?.trainer?.identificationPiece || "";
    const existingProofDocument = user?.trainer?.justificatifDocument || "";

    const fieldErrors = useMemo(() => ({
        profession: profession.trim() === "" ? "La profession est requise." : "",
        country: country.trim() === "" ? "Le pays ou la ville de résidence est requis." : "",
        domain: domain.trim() === "" ? "Le domaine principal est requis." : "",
        justification: justification.trim() === "" ? "Le justificatif de compétence est requis." : "",
        identificationPiece: !existingIdDocument && !idDocument ? "La pièce d'identification est requise." : "",
        justificatifDocument: !existingProofDocument && !proofDocument ? "Le document justificatif est requis." : "",
    }), [country, domain, existingIdDocument, existingProofDocument, idDocument, justification, profession, proofDocument]);

    const statusMessage = useMemo(() => {
        if (!user?.trainer) {
            return {
                tone: "text-gray-500 dark:text-gray-400",
                message: "Pas de dossier en cours.",
            };
        }

        if (user.trainer.valid) {
            return {
                tone: "text-green-500 dark:text-green-400",
                message: "Votre dossier a été approuvé. Vous êtes désormais formateur sur cette plateforme.",
            };
        }

        if (user.trainer.reject) {
            return {
                tone: "text-red-500 dark:text-red-400",
                message: `Votre dossier a été rejeté.${user.trainer.rejectReason ? ` Raison : ${user.trainer.rejectReason}` : ""}`,
            };
        }

        if (user.trainer.justificatifDocument) {
            return {
                tone: "text-blue-500 dark:text-blue-400",
                message: "Votre dossier est en cours de traitement, veuillez patienter.",
            };
        }

        return {
            tone: "text-yellow-600 dark:text-yellow-400",
            message: "Votre dossier est ouvert. Continuez à le remplir puis soumettez-le.",
        };
    }, [user]);

    const validateStep = (stepIndex: number) => {
        const stepKey = STEP_ORDER[stepIndex];

        if (stepKey === "identity") {
            if (fieldErrors.profession || fieldErrors.country || fieldErrors.domain) {
                setError(fieldErrors.profession || fieldErrors.country || fieldErrors.domain);
                setTimeout(() => setError(""), 5000);
                return false;
            }
        }

        if (stepKey === "proof") {
            if (fieldErrors.justification) {
                setError(fieldErrors.justification);
                setTimeout(() => setError(""), 5000);
                return false;
            }
        }

        if (stepKey === "documents") {
            if (fieldErrors.identificationPiece || fieldErrors.justificatifDocument) {
                setError(fieldErrors.identificationPiece || fieldErrors.justificatifDocument);
                setTimeout(() => setError(""), 5000);
                return false;
            }
        }

        return true;
    };

    const handleNextStep = () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setCurrentStep((previousStep) => Math.min(previousStep + 1, STEP_ORDER.length - 1));
    };

    const handlePreviousStep = () => {
        setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
    };

    const handleImageChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        kind: "id" | "proof",
    ) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Fichier trop lourd, il doit faire moins de 5 Mo.");
            setTimeout(() => setError(""), 5000);
            event.target.value = "";
            return;
        }

        if (kind === "id") {
            setIdDocument(file);
        } else {
            setProofDocument(file);
        }
    };

    const resetFileInputs = () => {
        if (idInputRef.current) {
            idInputRef.current.value = "";
        }

        if (proofInputRef.current) {
            proofInputRef.current.value = "";
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const allStepsValid = STEP_ORDER.every((_, stepIndex) => validateStep(stepIndex));

        if (!allStepsValid) {
            return;
        }

        setLoading(true);
        setError("");

        const form = new FormData();
        form.append("trainerId", user?.id || "");
        form.append("profession", profession.trim());
        form.append("domain", domain.trim());
        form.append("country", country.trim());
        form.append("justification", justification.trim());

        if (idDocument) {
            form.append("ID_image", idDocument);
        }

        if (proofDocument) {
            form.append("proof_image", proofDocument);
        }

        try {
            const res = await fetch(`/api/setUserInfo?trainerId=${user?.id || "ignore"}`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();

            if (!res.ok) {
                const formError = data.error || "Une erreur est survenue.";
                const fieldErrorMessage = data.fieldErrors
                    ? Object.values(data.fieldErrors).find(Boolean)
                    : "";

                setError([formError, fieldErrorMessage].filter(Boolean).join(" "));
                setTimeout(() => setError(""), 6000);
                return;
            }

            const refreshedUser = await refreshUser();
            if (refreshedUser) {
                setUser(refreshedUser);
            }

            resetFileInputs();
            setIdDocument(null);
            setProofDocument(null);
            setSuccess("Dossier formateur envoyé avec succès.");
            setTimeout(() => setSuccess(""), 4000);
            closeModal();
            router.refresh();
        } catch (requestError) {
            setError(
                requestError instanceof Error ? requestError.message : "Une erreur est survenue.",
            );
            setTimeout(() => setError(""), 6000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-4">
                            Devenir formateur
                        </h4>

                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            État de votre dossier
                        </p>
                        <p className={`mb-2 text-xs leading-normal ${statusMessage.tone}`}>
                            {statusMessage.message}
                        </p>
                    </div>

                    <button
                        onClick={openModal}
                        disabled={isValidated}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                    >
                        <PencilIcon className="h-4 w-4" />
                        {isValidated ? "Dossier validé" : isRejected ? "Corriger et renvoyer le dossier" : "Remplir votre dossier"}
                    </button>
                </div>

                <p className="mt-2 text-xs text-gray-800 dark:text-white/90">
                    Soyez l&apos;un des formateurs de notre plateforme et partagez votre expertise avec notre communauté d&apos;apprenants. En tant que formateur, vous pouvez créer vos propres formations, toucher un public plus large et contribuer à l&apos;éducation en ligne.
                </p>
            </div>

            {success && (
                <Notification state="success" title="Opération réussie" message={success} />
            )}

            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-175 m-4 h-screen py-2">
                <div className="relative w-full overflow-y-auto rounded-3xl bg-white p-4 no-scrollbar dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Votre dossier formateur
                        </h4>
                        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                            Remplissez chaque étape avec des informations cohérentes, puis envoyez le dossier pour validation.
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-3 px-2 md:grid-cols-3">
                        {STEP_ORDER.map((step, index) => {
                            const isActive = currentStep === index;
                            const isCompleted = currentStep > index;

                            return (
                                <div
                                    key={step}
                                    className={`rounded-2xl border px-4 py-3 text-sm ${isActive
                                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300"
                                        : isCompleted
                                            ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-500/10 dark:text-green-300"
                                            : "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
                                        }`}
                                >
                                    <p className="font-semibold">Étape {index + 1}</p>
                                    <p>
                                        {step === "identity" && "Identité professionnelle"}
                                        {step === "proof" && "Justification"}
                                        {step === "documents" && "Documents"}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar overflow-y-auto px-2">
                            {currentStep === 0 && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                        <div>
                                            <Label>Profession</Label>
                                            <Input
                                                type="text"
                                                defaultValue={profession}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfession(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label>Ville / Pays de résidence</Label>
                                            <Input
                                                type="text"
                                                defaultValue={country}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
                                            />
                                        </div>

                                        <div className="lg:col-span-2">
                                            <Label>Votre domaine principal</Label>
                                            <div className="relative mb-2">
                                                <Select
                                                    options={DOMAIN_OPTIONS}
                                                    defaultValue={domain}
                                                    placeholder="Choisissez une option"
                                                    onChange={(value) => setDomain(value)}
                                                    className="dark:bg-dark-900"
                                                />
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                                    <ChevronDownIcon />
                                                </span>
                                            </div>
                                            <Input
                                                placeholder="Autre domaine..."
                                                defaultValue={domain}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDomain(e.target.value)}
                                            />
                                            {fieldErrors.domain && (
                                                <p className="mt-2 text-sm text-red-500">{fieldErrors.domain}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <div>
                                        <Label>Expliquez brièvement votre maîtrise du domaine</Label>
                                        <TextArea
                                            rows={8}
                                            placeholder="Votre expérience, vos réalisations, vos diplômes ou tout autre élément utile..."
                                            onChange={(value) => setJustification(value)}
                                            value={justification}
                                            className="text-gray-800"
                                        />
                                        {fieldErrors.justification && (
                                            <p className="mt-2 text-sm text-red-500">{fieldErrors.justification}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <Label>Pièce d&apos;identification</Label>
                                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            Formats acceptés : JPG, PNG ou PDF. Taille maximale : 5 Mo.
                                        </p>
                                        {(existingIdDocument || idDocument) && (
                                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-500/10 dark:text-green-300">
                                                <FileText className="h-4 w-4" />
                                                {idDocument ? idDocument.name : getFileName(existingIdDocument)}
                                            </div>
                                        )}
                                        <FileInput
                                            ref={idInputRef}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => handleImageChange(e, "id")}
                                        />
                                        {fieldErrors.identificationPiece && (
                                            <p className="mt-2 text-sm text-red-500">{fieldErrors.identificationPiece}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Document justificatif</Label>
                                        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            Ajoutez un document qui confirme votre pratique du domaine.
                                        </p>
                                        {(existingProofDocument || proofDocument) && (
                                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-500/10 dark:text-green-300">
                                                <FileText className="h-4 w-4" />
                                                {proofDocument ? proofDocument.name : getFileName(existingProofDocument)}
                                            </div>
                                        )}
                                        <FileInput
                                            ref={proofInputRef}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => handleImageChange(e, "proof")}
                                        />
                                        {fieldErrors.justificatifDocument && (
                                            <p className="mt-2 text-sm text-red-500">{fieldErrors.justificatifDocument}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error !== "" && (
                                <div className="mt-5">
                                    <Notification state="error" title="Erreur lors de l'opération" message={error} />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 px-2 lg:flex-row lg:items-center lg:justify-end">
                            {currentStep > 0 && (
                                <Button size="sm" variant="outline" onClick={handlePreviousStep} disabled={loading}>
                                    Étape précédente
                                </Button>
                            )}

                            {currentStep < STEP_ORDER.length - 1 ? (
                                <Button size="sm" type="button" onClick={handleNextStep} disabled={loading}>
                                    Continuer
                                </Button>
                            ) : (
                                <Button size="sm" type="submit" disabled={loading}>
                                    Soumettre le dossier
                                </Button>
                            )}

                            <div className="flex items-center gap-3">
                                <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
                                    Fermer
                                </Button>
                                <div className="flex flex-col items-center justify-center">
                                    <ClipLoader
                                        color="#36d7b7"
                                        loading={loading}
                                        size={36}
                                        aria-label="Loading Spinner"
                                        data-testid="loader"
                                    />
                                    {loading && <p className="text-xs text-gray-500">Chargement...</p>}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
