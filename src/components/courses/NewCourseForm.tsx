"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Radio from "../form/input/Radio";
import Label from "../form/Label";
import TextArea from "../form/input/TextArea";
import FileInput from "../form/input/FileInput";
import Select from "../form/Select";
import { ChevronDownIcon } from "lucide-react";
import DatePicker from "../form/date-picker";
import Checkbox from "../form/input/Checkbox";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import Notification from "@/components/notification/Notification";
import {
    coerceDate,
    isSameCalendarDay,
    toLocalISOString,
} from "@@/lib/courseDateUtils";

const LANGUAGE_OPTIONS = [
    { value: "Français", label: "Français" },
    { value: "Anglais", label: "Anglais" },
    { value: "Bilingue", label: "Bilingue (FR/EN)" },
    { value: "Espagnol", label: "Espagnol" },
    { value: "Arabe", label: "Arabe" },
    { value: "Portugais", label: "Portugais" }, // Utile pour des pays comme l'Angola
];


const CURRENCY_OPTIONS = [
    { value: "XAF", label: "Franc CFA (CEMAC)" },
    { value: "XOF", label: "Franc CFA (UEMOA)" },
    { value: "NGN", label: "Naira (Nigeria)" },
    { value: "GHS", label: "Cedi (Ghana)" },
    { value: "KES", label: "Shilling (Kenya)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "USD", label: "Dollar ($)" },
    { value: "GBP", label: "Livre Sterling (£)" },
];


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
    { value: "RH", label: "Ressources Humaines" },
    { value: "Cloud", label: "Cloud & DevOps" },
    { value: "Contenu", label: "Contenu & Média" },
    { value: "Juridique", label: "Juridique" }
];


type DaySlotRow = {
    key: string;
    dateStr: string;
    startTime: string;
    endTime: string;
};

function newDaySlotRow(): DaySlotRow {
    return {
        key:
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,
        dateStr: "",
        startTime: "09:00",
        endTime: "17:00",
    };
}

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function formatTimeLocal(d: Date) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function rowToSlotIso(row: DaySlotRow): { startsAt: string; endsAt: string } | null {
    if (!row.dateStr || !row.startTime || !row.endTime) {
        return null;
    }
    const [y, mo, d] = row.dateStr.split("-").map((x) => Number(x));
    const [sh, sm] = row.startTime.split(":").map((x) => Number(x));
    const [eh, em] = row.endTime.split(":").map((x) => Number(x));
    if ([y, mo, d, sh, sm, eh, em].some((n) => Number.isNaN(n))) {
        return null;
    }
    const start = new Date(y, mo - 1, d, sh, sm, 0, 0);
    const end = new Date(y, mo - 1, d, eh, em, 0, 0);
    if (end <= start) {
        return null;
    }
    const sIso = toLocalISOString(start);
    const eIso = toLocalISOString(end);
    if (!sIso || !eIso) {
        return null;
    }
    return { startsAt: sIso, endsAt: eIso };
}

function slotsFromApiToRows(
    slots: { startsAt: string; endsAt: string }[],
): DaySlotRow[] {
    return slots.map((s) => {
        const st = coerceDate(s.startsAt);
        const en = coerceDate(s.endsAt);
        if (!st || !en) {
            return newDaySlotRow();
        }
        const y = st.getFullYear();
        const m = pad2(st.getMonth() + 1);
        const d = pad2(st.getDate());
        return {
            key:
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `${Date.now()}-${Math.random()}`,
            dateStr: `${y}-${m}-${d}`,
            startTime: formatTimeLocal(st),
            endTime: formatTimeLocal(en),
        };
    });
}

type Props = {
    session: Session | null;
    cId: string | undefined;
    /** YYYY-MM-DD depuis le calendrier (nouvelle formation uniquement). */
    prefillCalendarDate?: string;
};

export default function NewCourseForm({ session, cId, prefillCalendarDate }: Props) {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(0);
    const [language, setLanguage] = useState("");
    const [price, setPrice] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [domain, setDomain] = useState("");
    const [assumeCourse, setAssumeCourse] = useState(false);
    const [period, setPeriod] = useState<"one_day" | "many_days" | "">("");
    const [date, setDate] = useState<Date>();
    const [date_start, setDate_start] = useState<Date | null>(null);
    const [date_end, setDate_end] = useState<Date | null>(null);
    const [currency, setCurrency] = useState("XAF");
    const [courseId] = useState<string | undefined>(cId);
    const [images, setImages] = useState<{ [key: string]: File | null }>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");
    const [frontCover, setFrontCover] = useState<string | null>(null);
    const [backCover, setBackCover] = useState<string | null>(null);
    const [autoGenerateFrontCover, setAutoGenerateFrontCover] = useState(false);
    const [autoGenerateBackCover, setAutoGenerateBackCover] = useState(false);
    const [daySlots, setDaySlots] = useState<DaySlotRow[]>([]);
    const prefillAppliedRef = useRef(false);
    const isEditing = Boolean(courseId);

    if (!session) {
        return (
            <div className="dashboard-panel p-6 text-sm text-slate-600 dark:text-slate-300">
                Vous n&apos;êtes pas connecté.
            </div>
        );
    }

    useEffect(() => {
        prefillAppliedRef.current = false;
    }, [prefillCalendarDate]);

    useEffect(() => {
        if (courseId || !prefillCalendarDate || prefillAppliedRef.current) {
            return;
        }
        const m = prefillCalendarDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) {
            return;
        }
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const start = new Date(y, mo, d, 9, 0, 0, 0);
        const end = new Date(y, mo, d, 17, 0, 0, 0);
        setPeriod("one_day");
        setDate(start);
        setDate_start(start);
        setDate_end(end);
        setDaySlots([]);
        prefillAppliedRef.current = true;
    }, [courseId, prefillCalendarDate]);

    useEffect(() => {
        async function getCourse() {
            try {
                const res = await fetch(
                    courseId ? `/api/formation?courseId=${encodeURIComponent(courseId)}` : "/api/formation",
                );
                if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

                const data = await res.json();
                const nextDateStart = coerceDate(data.data.date_start);
                const nextDateEnd = coerceDate(data.data.date_end);
                const apiSlots = Array.isArray(data.data.slots) ? data.data.slots : [];

                setTitle(data.data.title);
                setDescription(data.data.description);
                setDuration(data.data.time);
                setLanguage(data.data.language);
                setDomain(data.data.domain);
                setPrice(data.data.price);
                setCurrency(data.data.currency || "XAF");
                setFrontCover(data.data.frontCover || null)
                setBackCover(data.data.backCover || null)
                console.log("frontCover", data.data.frontCover)


                if (apiSlots.length > 0) {
                    const normalized = apiSlots.map((s: { startsAt: string; endsAt: string }) => ({
                        startsAt: s.startsAt,
                        endsAt: s.endsAt,
                    }));
                    const rows = slotsFromApiToRows(normalized);
                    const first = coerceDate(normalized[0]?.startsAt);
                    const last = coerceDate(normalized[normalized.length - 1]?.endsAt);
                    const useOneDay =
                        normalized.length === 1 &&
                        first &&
                        last &&
                        isSameCalendarDay(first, last);

                    if (useOneDay) {
                        setPeriod("one_day");
                        setDate(first ?? undefined);
                        setDate_start(first);
                        setDate_end(last);
                        setDaySlots([]);
                    } else {
                        setPeriod("many_days");
                        setDaySlots(rows.length > 0 ? rows : [newDaySlotRow()]);
                        setDate_start(first);
                        setDate_end(last);
                    }
                } else {
                    setDate(nextDateStart ?? undefined);
                    setDate_start(nextDateStart);
                    setDate_end(nextDateEnd);
                    setPeriod(
                        nextDateStart && nextDateEnd && isSameCalendarDay(nextDateStart, nextDateEnd)
                            ? "one_day"
                            : "many_days",
                    );
                    if (
                        nextDateStart &&
                        nextDateEnd &&
                        !isSameCalendarDay(nextDateStart, nextDateEnd)
                    ) {
                        setDaySlots([
                            {
                                key: "legacy-a",
                                dateStr: `${nextDateStart.getFullYear()}-${pad2(nextDateStart.getMonth() + 1)}-${pad2(nextDateStart.getDate())}`,
                                startTime: formatTimeLocal(nextDateStart),
                                endTime: "18:00",
                            },
                            {
                                key: "legacy-b",
                                dateStr: `${nextDateEnd.getFullYear()}-${pad2(nextDateEnd.getMonth() + 1)}-${pad2(nextDateEnd.getDate())}`,
                                startTime: "09:00",
                                endTime: formatTimeLocal(nextDateEnd),
                            },
                        ]);
                    } else {
                        setDaySlots([]);
                    }
                }

                if (data.data.price === 0) {
                    setPrice(null);
                }

                setAssumeCourse(true);
            } catch (requestError) {
                console.error("Error updating course info:", requestError);
            }
        }

        if (courseId) {
            void getCourse();
        }
    }, [courseId]);

    const timeError = useMemo(() => {
        if (period === "many_days") {
            if (daySlots.length === 0) {
                return "Ajoutez au moins un jour de formation.";
            }
            for (const row of daySlots) {
                if (!row.dateStr.trim()) {
                    return "Chaque jour doit avoir une date.";
                }
                const slot = rowToSlotIso(row);
                if (!slot) {
                return "Horaires invalides : l'heure de fin doit être après l'heure de début.";
                }
                const st = coerceDate(slot.startsAt);
                const now = new Date();
                if (st && isSameCalendarDay(st, now)) {
                    const minAllowedStart = new Date(now.getTime() + 30 * 60000);
                    if (st < minAllowedStart) {
                        return "Pour aujourd'hui, l'heure de début doit être dans au moins 30 minutes.";
                    }
                }
            }
            return null;
        }

        if (!date_start || !date_end) return null;

        const now = new Date();
        const isToday = isSameCalendarDay(date_start, now);

        if (isToday) {
            const minAllowedStart = new Date(now.getTime() + 30 * 60000);
            if (date_start < minAllowedStart) {
                return "Pour aujourd'hui, l'heure de début doit être dans au moins 30 minutes.";
            }
        }

        if (date_end.getTime() === date_start.getTime()) {
            return "L'heure de fin ne peut pas être identique à l'heure de début.";
        }

        if (date_end < date_start) {
            return "L'heure de fin doit être après l'heure de début.";
        }

        return null;
    }, [date_end, date_start, daySlots, period]);

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fileName: string,
    ) => {
        if (e.target.files && e.target.files[0]) {
            const img = e.target.files[0];
            setImages((prev) => ({ ...prev, [fileName]: img }));
        }

        const file = e.target.files ? e.target.files[0] : null;
        if (file && file.size > 5 * 1024 * 1024) {
            alert("Fichier trop lourd !");
            setError("Fichier trop lourd : il doit faire moins de 5 Mo.");
            e.target.value = "";
            setTimeout(() => setError(""), 5000);
        }
    };


    const handleSelectChange = (value: string) => {
        setDomain(value);
    };

    const calculateDuration = (start: Date | null, end: Date | null) => {
        if (!start || !end) return { hours: 0, minutes: 0, totalMinutes: 0 };

        const diffInMs = end.getTime() - start.getTime();
        const totalMinutes = Math.floor(diffInMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return { hours, minutes, totalMinutes };
    };

    const durationTime = useMemo(() => {
        if (period === "many_days") {
            let totalMinutes = 0;
            for (const row of daySlots) {
                const slot = rowToSlotIso(row);
                if (!slot) continue;
                const a = coerceDate(slot.startsAt);
                const b = coerceDate(slot.endsAt);
                if (a && b && b > a) {
                    totalMinutes += Math.floor((b.getTime() - a.getTime()) / (1000 * 60));
                }
            }
            return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60, totalMinutes };
        }
        return calculateDuration(date_start, date_end);
    }, [date_end, date_start, daySlots, period]);

    useEffect(() => {
        if (period === "many_days") {
            setDuration(durationTime.totalMinutes);
        } else if (period === "one_day") {
            const { totalMinutes } = calculateDuration(date_start, date_end);
            setDuration(totalMinutes);
        }
    }, [date_start, date_end, period, durationTime.totalMinutes]);

    const durationText = useMemo(() => {
        const { hours, minutes } = durationTime;
        const hText = hours > 0 ? `${hours} ${hours === 1 ? "heure" : "heures"}` : "";
        const mText =
            minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : "";

        return [hText, mText].filter(Boolean).join(" et ");
    }, [durationTime]);

    const buildSlotsPayload = (): { startsAt: string; endsAt: string }[] | null => {
        if (period !== "one_day" && period !== "many_days") {
            return null;
        }
        if (period === "one_day") {
            if (!date_start || !date_end) return null;
            const a = toLocalISOString(date_start);
            const b = toLocalISOString(date_end);
            if (!a || !b) return null;
            return [{ startsAt: a, endsAt: b }];
        }
        const out: { startsAt: string; endsAt: string }[] = [];
        for (const row of daySlots) {
            const slot = rowToSlotIso(row);
            if (!slot) {
                return null;
            }
            out.push(slot);
        }
        out.sort(
            (x, y) =>
                new Date(x.startsAt).getTime() - new Date(y.startsAt).getTime(),
        );
        return out.length > 0 ? out : null;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!period) {
            setError("Choisissez la période (un jour ou plusieurs jours).");
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        const slotsPayload = buildSlotsPayload();
        const totalFromSlots =
            slotsPayload?.reduce((acc, s) => {
                const a = coerceDate(s.startsAt);
                const b = coerceDate(s.endsAt);
                if (a && b && b > a) {
                    return acc + Math.floor((b.getTime() - a.getTime()) / (1000 * 60));
                }
                return acc;
            }, 0) ?? 0;

        if (
            title.trim() === "" ||
            language.trim() === "" ||
            description.trim() === "" ||
            domain.trim() === "" ||
            !slotsPayload ||
            slotsPayload.length === 0 ||
            totalFromSlots === 0
        ) {
            alert("Vous devez remplir toutes ces informations avant de lancer votre formation.");
            setError(
                "Vous devez remplir toutes ces informations avant de lancer votre formation.",
            );
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        if (price !== null && price <= 0) {
            setError("Un cours payant doit avoir un prix strictement positif.");
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        if (price !== null && !CURRENCY_OPTIONS.some((option) => option.value === currency)) {
            setError("Veuillez choisir une devise valide pour un cours payant.");
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        if (!assumeCourse) {
            alert("Vous devez certifier que vous maîtrisez bien ce domaine pour lancer une formation.");
            setError(
                "Vous devez certifier que vous maîtrisez bien ce domaine pour lancer une formation.",
            );
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        const firstStart = coerceDate(slotsPayload[0].startsAt);
        if (firstStart && firstStart < new Date()) {
            alert("La date ne peut pas être dans le passé.");
            setError("La date ne peut pas être dans le passé.");
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        if (timeError) {
            setError(timeError);
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            return;
        }

        const boundsStart = coerceDate(slotsPayload[0].startsAt);
        const boundsEnd = coerceDate(slotsPayload[slotsPayload.length - 1].endsAt);
        const serializedStart = boundsStart ? toLocalISOString(boundsStart) : null;
        const serializedEnd = boundsEnd ? toLocalISOString(boundsEnd) : null;

        const form = new FormData();
        form.append("title", title);
        form.append("userId", session.user.id || "");
        form.append("courseId", cId ?? "");
        form.append("duration", String(totalFromSlots));
        form.append("language", language);
        form.append("price", price ? price.toString() : "0");
        form.append("description", description);
        form.append("domain", domain);
        form.append("slotsJson", JSON.stringify(slotsPayload));

        if (period === "one_day" && serializedStart) {
            form.append("date", serializedStart);
        }

        if (serializedStart) {
            form.append("date_start", serializedStart);
        }
        if (serializedEnd) {
            form.append("date_end", serializedEnd);
        }

        form.append("currency", currency);
        form.append("autoGenerateFrontCover", String(autoGenerateFrontCover));
        form.append("autoGenerateBackCover", String(autoGenerateBackCover));

        if (images[title + (cId ?? "") + "-frontCover"]) {
            form.append(
                `${title}${cId ?? ""}-frontCover`,
                images[title + (cId ?? "") + "-frontCover"] || "",
            );
        }

        if (images[title + (cId ?? "") + "-backCover"]) {
            form.append(
                `${title}${cId ?? ""}-backCover`,
                images[title + (cId ?? "") + "-backCover"] || "",
            );
        }

        try {
            const res = await fetch("/api/setCourse", {
                method: "POST",
                body: form,
            });
            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.error || "Une erreur est survenue. Veuillez réessayer.";
                console.error("Erreur API :", errorMessage);
                setError(errorMessage);
                setLoading(false);
                setTimeout(() => setError(""), 5000);
                return;
            }

            setLoading(false);
            router.push(`/courses_state?update=${Date.now()}`);
            setError("");
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Une erreur est survenue. Veuillez réessayer.",
            );
            setLoading(false);
            setTimeout(() => setError(""), 5000);
            console.error("Error updating course info:", requestError);
        }
    };

    return (
        <>
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.4fr]">
                <aside className="dashboard-panel h-fit p-5 lg:p-6">
                    <div className="space-y-5">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
                                Assistant de publication
                            </p>
                            <h4 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                                {isEditing ? "Édition encadrée" : "Création pas à pas"}
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                                La logique de création reste intacte, avec une lecture plus claire des créneaux, du tarif et de la publication finale.
                            </p>
                        </div>

                        <div className="grid gap-3">
                            <div className="dashboard-subpanel p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                    Mode
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                    {isEditing ? "Mise à jour de formation" : "Nouvelle formation"}
                                </p>
                            </div>
                            <div className="dashboard-subpanel p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                    Durée totale
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                    {durationTime.totalMinutes > 0 ? durationText : "À définir"}
                                </p>
                            </div>
                            <div className="dashboard-subpanel p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                    Prix
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                    {price === null ? "Gratuite" : `${price} ${currency}`}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                            Renseignez d&apos;abord le titre, la période et le domaine. Les contrôles temporels et de cohérence existants restent actifs au moment de la soumission.
                        </div>
                    </div>
                </aside>

                <div className="dashboard-panel relative w-full overflow-y-auto p-4 no-scrollbar dark:bg-gray-900 lg:p-8">
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="space-y-4 px-2 lg:space-y-6">
                            <div>
                                <Label>Titre</Label>
                                <Input
                                    type="text"
                                    placeholder="Titre de votre formation"
                                    defaultValue={title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setTitle(e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <Label>Période</Label>
                                <div className="mb-4 flex flex-wrap items-center gap-4">
                                    <Radio
                                        id="one_day"
                                        label="Un jour"
                                        name="period"
                                        value="one_day"
                                        checked={period === "one_day"}
                                        onChange={() => {
                                            setPeriod("one_day");
                                            setDaySlots([]);
                                        }}
                                    />
                                    <Radio
                                        id="many_days"
                                        label="Plusieurs jours"
                                        name="period"
                                        value="many_days"
                                        checked={period === "many_days"}
                                        onChange={() => {
                                            setPeriod("many_days");
                                            setDaySlots((prev) => {
                                                if (prev.length > 0) {
                                                    return prev;
                                                }
                                                if (date_start && date_end) {
                                                    return [
                                                        {
                                                            key: "seed-1",
                                                            dateStr: `${date_start.getFullYear()}-${pad2(date_start.getMonth() + 1)}-${pad2(date_start.getDate())}`,
                                                            startTime: formatTimeLocal(date_start),
                                                            endTime: formatTimeLocal(date_end),
                                                        },
                                                    ];
                                                }
                                                return [newDaySlotRow()];
                                            });
                                        }}
                                    />
                                </div>

                                {period === "many_days" && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Pour chaque jour, indiquez la date, l&apos;heure de début et l&apos;heure
                                            de fin du créneau.
                                        </p>
                                        {daySlots.map((row, index) => (
                                            <div
                                                key={row.key}
                                                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 dark:border-gray-800 md:flex-row md:items-end"
                                            >
                                                <div className="flex-1">
                                                    <Label>Date (jour {index + 1})</Label>
                                                    <Input
                                                        type="date"
                                                        value={row.dateStr}
                                                        min={new Date().toISOString().slice(0, 10)}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setDaySlots((rows) =>
                                                                rows.map((r) =>
                                                                    r.key === row.key ? { ...r, dateStr: v } : r,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Début</Label>
                                                    <Input
                                                        type="time"
                                                        value={row.startTime}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setDaySlots((rows) =>
                                                                rows.map((r) =>
                                                                    r.key === row.key ? { ...r, startTime: v } : r,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Fin</Label>
                                                    <Input
                                                        type="time"
                                                        value={row.endTime}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setDaySlots((rows) =>
                                                                rows.map((r) =>
                                                                    r.key === row.key ? { ...r, endTime: v } : r,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                                                    onClick={() =>
                                                        setDaySlots((rows) =>
                                                            rows.length <= 1
                                                                ? rows
                                                                : rows.filter((r) => r.key !== row.key),
                                                        )
                                                    }
                                                >
                                                    Retirer
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setDaySlots((rows) => [...rows, newDaySlotRow()])
                                            }
                                        >
                                            Ajouter un jour
                                        </Button>
                                    </div>
                                )}

                                {period === "one_day" && (
                                    <div className="flex flex-col items-start gap-4 md:flex-row">
                                        <DatePicker
                                            id="dateStart"
                                            label={"Date du jour"}
                                            hourLabel={"Heure de départ"}
                                            oneDayDate="dateStart_oneDay"
                                            defaultDate={date}
                                            onChange={(nextDate) => {
                                                setDate(nextDate || undefined);
                                                setDate_start(nextDate || null);
                                            }}
                                        />

                                        <DatePicker
                                            id="dateEnd"
                                            label={"Rappel de date de fin"}
                                            hourLabel={"Heure de fin"}
                                            oneDayDate="dateEnd_oneDay"
                                            value={date_start}
                                            defaultDate={date_end ?? date}
                                            onChange={(nextDate) => setDate_end(nextDate || null)}
                                        />
                                    </div>
                                )}

                                {durationTime.totalMinutes > 0 && (
                                    <p className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-brand-600 dark:bg-sky-500/10 dark:text-sky-300">
                                        Durée totale des créneaux : {durationText}
                                    </p>
                                )}

                                {timeError && (
                                    <div className="animate-pulse rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                        {timeError}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Domaine de la formation</Label>
                                <div className="relative mb-2">
                                    <Select
                                        options={DOMAIN_OPTIONS}
                                        defaultValue={domain}
                                        placeholder="Choisissez un domaine"
                                        onChange={handleSelectChange}
                                        className="dark:bg-dark-900"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                                <Input
                                    placeholder="Autre..."
                                    defaultValue={domain}
                                    onChange={(e) => handleSelectChange((e.target as HTMLInputElement).value)}
                                />
                            </div>

                            <div>
                                <Label>Langue</Label>
                                <div>
                                    <div className="relative mb-2">
                                        <Select
                                            options={LANGUAGE_OPTIONS}
                                            defaultValue={language}
                                            placeholder="Choisissez une langue"
                                            onChange={(v) => setLanguage(v)}
                                            className="dark:bg-dark-900"
                                        />
                                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                            <ChevronDownIcon />
                                        </span>
                                    </div>
                                    <Input
                                        placeholder="Autre..."
                                        defaultValue={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Description</Label>
                                <TextArea
                                    className="text-gray-700 dark:text-white/90"
                                    rows={5}
                                    placeholder={"Donnez une description claire du contenu, du niveau et des objectifs de la formation"}
                                    onChange={(value) => setDescription(value)}
                                    value={description}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="dashboard-subpanel p-4">
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Image de premier plan
                                    </label>
                                    {frontCover && <p className="mb-2 text-xs text-green-500">Vous pouvez modifier l'image</p>}
                                    <div className="mb-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={autoGenerateFrontCover}
                                                onChange={(checked) => setAutoGenerateFrontCover(checked)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    Laisser DIVLAB AI générer automatiquement (bêta)
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Le template officiel sera rempli avec les informations de cette formation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <FileInput
                                        accept="image/*"
                                        disabled={autoGenerateFrontCover}
                                        onChange={(e) => handleImageChange(e, title + (cId ?? "") + "-frontCover")}
                                        className=""
                                    />
                                    <p className="text-gray-400 text-sm dark:text-gray-300">Image affichée en premier plan pour identifier rapidement la formation.</p>
                                </div>

                                <div className="dashboard-subpanel p-4">
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Image d'arrière-plan
                                    </label>
                                    {backCover && <p className="mb-2 text-xs text-green-500">Vous pouvez modifier l'image</p>}
                                    <div className="mb-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={autoGenerateBackCover}
                                                onChange={(checked) => setAutoGenerateBackCover(checked)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    Laisser DIVLAB AI générer automatiquement (bêta)
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Une version grand format sera créée pour la page des détails.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <FileInput
                                        accept="image/*"
                                        disabled={autoGenerateBackCover}
                                        onChange={(e) => handleImageChange(e, title + (cId ?? "") + "-backCover")}
                                        className=""
                                    />
                                    <p className="text-gray-400 text-sm dark:text-gray-300">Image affichée en arrière-plan sur la page de détails pour renforcer la présentation de la formation.</p>
                                </div>
                            </div>

                            <div>
                                <Label>Prix</Label>
                                <div className="mb-2 flex flex-wrap items-center gap-4">
                                    <Radio
                                        id="free"
                                        label="Gratuite"
                                        name="price"
                                        value="free"
                                        checked={price === null}
                                        onChange={() => setPrice(null)}
                                    />
                                    <Radio
                                        id="paid"
                                        label="Payante"
                                        name="price"
                                        value="paid"
                                        checked={price != null}
                                        onChange={() => setPrice(0)}
                                    />
                                    {price !== null && (
                                        <div className="flex w-full flex-col gap-2 md:flex-row">
                                            <Input
                                                type="number"
                                                defaultValue={price}
                                                placeholder="Entrez le prix"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setPrice(Number(e.target.value))
                                                }
                                            />

                                            <div className="relative">
                                                <Select
                                                    options={CURRENCY_OPTIONS}
                                                    defaultValue={currency}
                                                    placeholder={"Devise"}
                                                    onChange={(v) => setCurrency(v)}
                                                    className="dark:bg-dark-900"
                                                />
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                                    <ChevronDownIcon />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={assumeCourse || isEditing}
                                        onChange={(checked) => setAssumeCourse(checked)}
                                        disabled={isEditing}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Je certifie que je maîtrise bien ce domaine et que je peux dispenser une formation de qualité.
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Cette confirmation reste requise pour une nouvelle publication. En mode édition, elle est conservée automatiquement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 px-2 pt-6 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-300">
                                {loading
                                    ? "Enregistrement en cours..."
                                    : "Les données seront enregistrées avec les mêmes contrôles métier qu'avant."}
                            </p>
                            <Button disabled={!session || (!assumeCourse && !isEditing) || loading} size="sm" type="submit">
                                {isEditing ? "Modifier la formation" : "Lancer la formation"}
                            </Button>
                        </div>
                    </form>
                    <div className="fixed bottom-5 left-5 z-9999 flex flex-col items-center justify-center">
                        <ClipLoader
                            color="#36d7b7"
                            loading={loading}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    </div>
                </div>



                {error != "" && (
                    <Notification
                        state="error"
                        title="Erreur lors de l'opération"
                        message={error}
                    />
                )}
            </div>
        </>
    );
}
