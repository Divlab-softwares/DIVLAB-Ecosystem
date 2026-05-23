"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import bcrypt from "bcryptjs";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  EyeIcon,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { ChevronDownIcon } from "../../../icons";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";
import PhoneInput from "../group-input/PhoneInput";
import Checkbox from "../input/Checkbox";
import Notification from "@/components/notification/Notification";
import { ClipLoader } from "react-spinners";

type Props = {
  Session: Session | null;
  CourseId: string;
  CoursePrice: number;
  CourseCurrency?: string;
  purchased?: boolean;
  DL_LV: boolean;
  isTrainer: boolean;
  courseTitle?: string;
  courseState?: string;
  nextSlotLabel?: string | null;
};

function InfoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}



export default function PurchaseForm({
  Session,
  CourseId,
  CoursePrice,
  CourseCurrency,
  purchased,
  DL_LV,
  isTrainer,
  courseTitle,
  courseState,
  nextSlotLabel,
}: Props) {
  const router = useRouter();
  const hasPurchased = Boolean(purchased);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isChecked, setIsChecked] = useState(Boolean(Session));
  const [stayConnected, setStayConnected] = useState(true);
  const [checkPassword, setCheckPassword] = useState<number>(Session ? 1 : 2);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    CC: "",
    p_method: "",
  });

  useEffect(() => {
    if (Session) {
      const userName = Session.user?.name || "";
      const userEmail = Session.user?.email || "";
      setName(userName);
      setEmail(userEmail);
    }
  }, [Session]);

  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setEmailError(!isValidEmail);
    return isValidEmail;
  };

  const showTemporaryError = (message: string, timeout = 5000) => {
    setError(message);
    window.setTimeout(() => setError(""), timeout);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
    setFormData((current) => ({ ...current, email: value }));
  };

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setFormData((current) => ({ ...current, phone: phoneNumber }));
  };

  const handleSelectChange = (value: string) => {
    setPaymentMethod(value);
    setFormData((current) => ({ ...current, p_method: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target;
    setFormData((current) => ({ ...current, [fieldName]: value }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (!confirmedPassword) {
      setCheckPassword(2);
      return;
    }

    setCheckPassword(value === confirmedPassword ? 1 : 0);
  };

  const handleConfirmedPasswordChange = (value: string) => {
    setConfirmedPassword(value);

    if (!value) {
      setCheckPassword(2);
      return;
    }

    setCheckPassword(value === password ? 1 : 0);
  };

  function ActionLink({ href, label }: { href: string; label: string }) {

    return (
      <Link
        href={href}
        onClick={() => setLoading(true)}
        className="relative inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-blue-500/50 dark:hover:text-blue-300"
      >
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    );
  }

  const initPayment = async () => {
    try {
      const response = await fetch("/api/initPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email,
          formationId: CourseId,
          customerName: Session?.user?.name || `${firstName} ${lastName}`.trim(),
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        return data as {
          success: boolean;
          mode: "free" | "paid";
          authorizationUrl?: string;
          redirectPath?: string;
        };
      }

      showTemporaryError(
        data.error || "Une erreur est survenue lors de l'initialisation du paiement.",
        5000,
      );
      return null;
    } catch (requestError) {
      showTemporaryError(
        requestError instanceof Error
          ? requestError.message
          : "Une erreur est survenue lors de l'initialisation du paiement.",
        5000,
      );
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Session) {
      setLoading(true);
      setError("");

      const paymentStarted = await initPayment();
      if (paymentStarted?.mode === "free" && paymentStarted.redirectPath) {
        router.refresh();
        router.push(paymentStarted.redirectPath);
      }

      if (paymentStarted?.mode === "paid" && paymentStarted.authorizationUrl) {
        window.location.href = paymentStarted.authorizationUrl;
      }

      setLoading(false);
      return;
    }

    if (!isChecked) {
      showTemporaryError(
        "Vous devez accepter nos termes et conditions ainsi que notre politique de confidentialité.",
      );
      return;
    }

    if (checkPassword !== 1) {
      showTemporaryError("Les mots de passe doivent être identiques.");
      return;
    }

    if (firstName.trim() === "" || lastName.trim() === "") {
      showTemporaryError("Veuillez entrer un nom et un prénom.");
      return;
    }

    setLoading(true);
    setError("");

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password: hashedPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      const signedUp = response.ok || Boolean(data?.signedUp);

      if (!signedUp) {
        showTemporaryError(data?.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      const paymentStarted = await initPayment();
      if (!paymentStarted) {
        setLoading(false);
        return;
      }

      if (paymentStarted.mode === "paid" && paymentStarted.authorizationUrl) {
        window.location.href = paymentStarted.authorizationUrl;
        return;
      }

      if (stayConnected) {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          showTemporaryError(
            "Informations erronées. Vérifiez votre email ou votre mot de passe.",
          );
          setLoading(false);
          return;
        }

        router.refresh();
        router.push(paymentStarted.redirectPath || `/my_courses?update=${Date.now()}`);
      } else {
        router.refresh();
        router.push(paymentStarted.redirectPath || "/available_courses");
      }
    } catch (requestError) {
      showTemporaryError(
        `Une erreur est survenue : ${requestError instanceof Error ? requestError.message : requestError
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { value: "MOMO", label: "Mobile money" },
    { value: "OM", label: "Orange money" },
    { value: "CC", label: "Carte bancaire" },
  ];

  const countries = [
    { code: "US", label: "+1 " },
    { code: "GB", label: "+44 " },
    { code: "CA", label: "+1 " },
    { code: "AU", label: "+61 " },
    { code: "CM", label: "+237 " },
  ];

  const cardMeta = useMemo(() => {
    if (Session && isTrainer) {
      return {
        title: "Espace formateur",
        desc: "Cette formation vous appartient. Retrouvez ici les actions utiles pour préparer, suivre et animer vos sessions.",
      };
    }

    if (Session && hasPurchased) {
      return {
        title: "Participation confirmée",
        desc: "Votre inscription est déjà enregistrée. Voici la suite du parcours pour suivre la formation sans confusion.",
      };
    }

    if (Session) {
      return {
        title: "Réserver votre place",
        desc: "Vérifiez vos informations puis finalisez la souscription pour retrouver ensuite cette formation dans votre espace.",
      };
    }

    if (DL_LV) {
      return {
        title: "Créer votre compte et rejoindre la formation",
        desc: "Renseignez vos informations pour ouvrir un compte Divlab, puis validez votre participation à cette formation.",
      };
    }

    return {
      title: "Connexion requise",
      desc: "Connectez-vous à votre compte Divlab pour rejoindre la formation et suivre toutes les prochaines étapes.",
    };
  }, [DL_LV, Session, hasPurchased, isTrainer]);

  const trainerSummary = useMemo(() => {
    if (!isTrainer) {
      return null;
    }

    return {
      intro:
        courseState === "started"
          ? "La formation est en cours. Votre prochaine action importante se trouve dans l'espace de pilotage des sessions."
          : "Vous êtes le référent de cette formation. Vous pouvez encore revoir l'organisation et préparer sereinement l'expérience apprenant.",
      planning:
        nextSlotLabel ??
        "Les horaires détaillés seront visibles dans votre espace de suivi une fois la session programmée.",
    };
  }, [courseState, isTrainer, nextSlotLabel]);

  const participantSummary = useMemo(() => {
    if (!hasPurchased || isTrainer) {
      return null;
    }

    return {
      intro:
        courseState === "started"
          ? "La formation est déjà active. Ouvrez Mes formations pour retrouver la fiche, vérifier l'état de la salle et rejoindre la session au bon moment."
          : "Votre place est bien réservée. Vous n'avez plus besoin de refaire une souscription pour cette formation.",
      planning:
        nextSlotLabel ??
        "Vous recevrez ensuite les rappels utiles et retrouverez cette formation dans votre espace apprenant.",
    };
  }, [courseState, hasPurchased, isTrainer, nextSlotLabel]);

  return (
    <ComponentCard title={cardMeta.title} desc={cardMeta.desc}>
      <div className="fixed bottom-1 right-1 justify-center">
        <ClipLoader
          color="#36d7b7"
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
      {Session ? (
        isTrainer ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-sky-200 bg-sky-50/80 p-5 dark:border-sky-900/40 dark:bg-sky-500/10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm dark:bg-slate-950 dark:text-sky-300">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-sky-900 dark:text-sky-100">
                    Vous animez déjà cette formation
                  </h4>
                  <p className="text-sm leading-6 text-sky-900/85 dark:text-sky-100/90">
                    {trainerSummary?.intro}
                  </p>
                  <p className="text-sm font-medium text-sky-800 dark:text-sky-200">
                    Repère planning : {trainerSummary?.planning}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoItem
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Pilotage de session"
                description="Retrouvez cette formation dans vos formations lancées pour surveiller son état et préparer le démarrage."
              />
              <InfoItem
                icon={<Users className="h-5 w-5" />}
                title="Suivi des inscrits"
                description="Consultez l'audience et les participants pour garder une vision claire de la mobilisation autour de la session."
              />
              <InfoItem
                icon={<Video className="h-5 w-5" />}
                title="Animation en ligne"
                description="Le jour venu, vous pourrez lancer la salle et accompagner les participants directement depuis votre espace."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink href={`/courses_state#${CourseId}`} label="Voir mes formations lancées" />
              <ActionLink href={`/launch_courses?courseId=${CourseId}`} label="Mettre à jour la formation" />
              <ActionLink href={`/audience?courseId=${CourseId}`} label="Consulter l'audience" />
            </div>
          </div>
        ) : hasPurchased ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/40 dark:bg-emerald-500/10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                    Votre inscription est confirmée
                  </h4>
                  <p className="text-sm leading-6 text-emerald-900/85 dark:text-emerald-100/90">
                    {participantSummary?.intro}
                  </p>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Prochain repère : {participantSummary?.planning}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoItem
                icon={<BookOpen className="h-5 w-5" />}
                title="Où retrouver la formation"
                description="Toute la suite se passe dans Mes formations, sans nouvelle inscription à effectuer."
              />
              <InfoItem
                icon={<CalendarDays className="h-5 w-5" />}
                title="Avant le démarrage"
                description="Consultez régulièrement la fiche de formation pour confirmer les horaires et préparer votre disponibilité."
              />
              <InfoItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Le jour J"
                description="Ouvrez la fiche depuis Mes formations pour vérifier l'état de la salle et rejoindre la session au bon moment."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionLink href={`/my_courses#${CourseId}`} label="Ouvrir Mes formations" />
              <ActionLink href="/available_courses" label="Explorer d'autres formations" />
            </div>

            {courseTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                La formation <span className="font-semibold text-gray-800 dark:text-white">{courseTitle}</span> restera accessible dans votre espace apprenant.
              </p>
            )}
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label>Nom complet</Label>
              <Input type="text" name="name" defaultValue={name} onChange={handleChange} />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                defaultValue={email}
                error={emailError}
                onChange={handleEmailChange}
                placeholder="Entrez votre email"
                hint={emailError ? "Adresse email invalide." : ""}
              />
            </div>

            {CoursePrice > 0 && (
              <div>
                <Label>Méthode de paiement</Label>
                <div className="relative">
                  <Select
                    options={options}
                    placeholder="Choisir une option"
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === "CC" ? (
              <div>
                <Label htmlFor="tm">Carte bancaire</Label>
                <div className="relative">
                  <Input
                    type="text"
                    name="CC"
                    onChange={handleChange}
                    placeholder="Numéro de carte"
                    className="pl-[62px]"
                  />
                  <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                      <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                      <path
                        d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                        fill="#FC6020"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            ) : paymentMethod === "MOMO" || paymentMethod === "OM" ? (
              <div>
                <Label>Telephone</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  onChange={handlePhoneNumberChange}
                />
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="relative mt-4 w-full cursor-pointer rounded-2xl bg-white p-3 text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
            >
              {loading ? "Veuillez patienter..." : CoursePrice > 0 ? `Acheter avec NotchPay (${CourseCurrency || "XAF"})` : "Je participe"}
            </button>

            <div className="mt-5 flex flex-col items-center justify-center">
              <ClipLoader
                color="#36d7b7"
                loading={loading}
                size={50}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              {loading && <p>Chargement en cours...</p>}
            </div>

            {success && (
              <Notification state="success" title="Opération réussie" message="" />
            )}

            {error !== "" && (
              <Notification
                state="error"
                title="Erreur lors de l'opération"
                message={error}
              />
            )}
          </form>
        )
      ) : DL_LV && CourseId !== undefined ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-gray-100 p-3 text-sm font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-100">
            Remplissez ce formulaire pour créer votre compte Divlab ou vous connecter, puis finaliser votre participation.
          </div>

          <div>
            <Label>Nom</Label>
            <Input
              type="text"
              name="firstname"
              defaultValue={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <Label>Prénom</Label>
            <Input
              type="text"
              name="lastname"
              defaultValue={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              defaultValue={email}
              error={emailError}
              onChange={handleEmailChange}
              placeholder="Entrez votre email"
              hint={emailError ? "Adresse email invalide." : ""}
            />
          </div>

          <div>
            <Label>
              Entrez un mot de passe<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Entrez votre mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeOff className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {checkPassword === 1 ? (
            <div className="rounded-xl bg-green-400 p-2 text-sm text-white">
              Les mots de passe sont identiques.
            </div>
          ) : checkPassword === 0 ? (
            <div className="rounded-xl bg-red-400 p-2 text-sm text-white">
              Les mots de passe sont différents.
            </div>
          ) : (
            <div className="rounded-xl bg-yellow-400 p-2 text-sm text-gray-900">
              Veuillez confirmer le mot de passe.
            </div>
          )}

          <div>
            <Label>
              Confirmer le mot de passe <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Confirmez votre mot de passe"
                type={showConfirmedPassword ? "text" : "password"}
                value={confirmedPassword}
                onChange={(e) => handleConfirmedPasswordChange(e.target.value)}
                required
              />
              <span
                onClick={() => setShowConfirmedPassword(!showConfirmedPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showConfirmedPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeOff className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          {CoursePrice > 0 && (
            <ComponentCard title="Méthode de paiement sécurisée">
              <div>
                <Label>Méthode de paiement</Label>
                <div className="relative">
                  <Select
                    options={options}
                    placeholder="Choisir une option"
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>

              {paymentMethod === "CC" ? (
                <div>
                  <Label htmlFor="tm">Carte bancaire</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      name="CC"
                      onChange={handleChange}
                      placeholder="Numéro de carte"
                      className="pl-[62px]"
                    />
                    <span className="absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="6.25" cy="10" r="5.625" fill="#E80B26" />
                        <circle cx="13.75" cy="10" r="5.625" fill="#F59D31" />
                        <path
                          d="M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z"
                          fill="#FC6020"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              ) : paymentMethod === "MOMO" || paymentMethod === "OM" ? (
                <div>
                  <Label>Telephone</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countries}
                    placeholder="+1 (555) 000-0000"
                    onChange={handlePhoneNumberChange}
                  />
                </div>
              ) : null}
            </ComponentCard>
          )}

          <div className="flex items-center gap-3">
            <Checkbox className="h-5 w-5" checked={stayConnected} onChange={setStayConnected} />
            <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
              Rester connecté
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox className="h-5 w-5" checked={isChecked} onChange={setIsChecked} />
            <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
              En créant un compte, vous acceptez nos{" "}
              <Link
                href="https://divlabs-tech.com/cgv"
                target="_blank"
                className="text-gray-800 hover:text-blue-500 hover:underline dark:text-white/90 z-999"
              >
                termes et conditions
              </Link>{" "}
              ainsi que notre{" "}
              <Link
                href="https://divlabs-tech.com/privacy-policy"
                target="_blank"
                className="text-gray-800 hover:text-blue-500 hover:underline dark:text-white z-999"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative mt-4 w-full cursor-pointer rounded-2xl bg-white p-3 text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            {loading ? "Veuillez patienter..." : CoursePrice > 0 ? `Acheter avec NotchPay (${CourseCurrency || "XAF"})` : "Je participe"}
          </button>

          <div className="mt-5 flex flex-col items-center justify-center">
            <ClipLoader
              color="#36d7b7"
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            {loading && <p>Chargement en cours...</p>}
          </div>

          {success && (
              <Notification state="success" title="Opération réussie" message="" />
          )}

          {error !== "" && (
            <Notification
              state="error"
                title="Erreur lors de l'opération"
              message={error}
            />
          )}
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm leading-6 text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
            Connectez-vous pour finaliser votre participation, retrouver ensuite la
            formation dans votre espace et suivre les prochaines instructions.
          </div>

          <Link
            href="/signin"
            onClick={() => setLoading(true)}
            className={`mt-1 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] ${loading ? "pointer-events-none opacity-70" : ""
              }`}
          >
            {!loading ? "Se connecter" : "Veuillez patienter..."}
          </Link>

          <div className="mt-5 flex flex-col items-center justify-center">
            <ClipLoader
              color="#36d7b7"
              loading={loading}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
            {loading && <p>Chargement en cours...</p>}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vous n&apos;avez pas encore de compte Divlab ?{" "}
            <Link href="/signup" className="text-blue-500 underline">
              Créer votre compte ici
            </Link>
            .
          </p>
        </div>
      )}
    </ComponentCard>
  );
}
