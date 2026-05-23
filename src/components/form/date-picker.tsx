import { useEffect, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import Label from "./Label";
import { CalenderIcon } from "../../icons";
import { coerceDate, isSameCalendarDay } from "@@/lib/courseDateUtils";

type DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  hourId?: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange: (...args: any[]) => void;
  defaultDate?: DateOption | null;
  label?: string;
  hourLabel?: string;
  placeholder?: string;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  oneDayDate?: "dateStart_oneDay" | "dateEnd_oneDay";
  value?: Date | string | null;
  minTime?: string;
};

const formatNiceDate = (dateString: string) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
};

export default function DatePicker({
  id,
  hourId,
  onChange,
  label,
  hourLabel,
  defaultDate,
  placeholder,
  minDate,
  maxDate,
  oneDayDate,
  value,
}: PropsType) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const getDefaultTime = () => {
    const d = new Date(Date.now() + 30 * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const [selectedTime, setSelectedTime] = useState(getDefaultTime());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!dateInputRef.current) return;

    const initialDate = coerceDate(defaultDate) ?? new Date();

    fpRef.current = flatpickr(dateInputRef.current, {
      locale: "fr",
      monthSelectorType: "static",
      minDate: minDate || "today",
      maxDate: maxDate || undefined,
      dateFormat: "Y-m-d",
      defaultDate: initialDate,
      onReady: (_, __, instance) => {
        const baseDate = instance.selectedDates[0] ?? initialDate;
        const y = baseDate.getFullYear();
        const m = String(baseDate.getMonth() + 1).padStart(2, "0");
        const d = String(baseDate.getDate()).padStart(2, "0");
        setSelectedDate(`${y}-${m}-${d}`);
      },
      onChange: (selectedDates) => {
        if (!selectedDates[0]) return;

        const y = selectedDates[0].getFullYear();
        const m = String(selectedDates[0].getMonth() + 1).padStart(2, "0");
        const d = String(selectedDates[0].getDate()).padStart(2, "0");
        setSelectedDate(`${y}-${m}-${d}`);
      },
    });

    setSelectedTime(
      `${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}`,
    );

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, [defaultDate, id, maxDate, minDate]);

  useEffect(() => {
    if (fpRef.current && minDate) {
      fpRef.current.set("minDate", minDate);
    }
    if (fpRef.current && maxDate) {
      fpRef.current.set("maxDate", maxDate);
    }
  }, [minDate, maxDate]);

  useEffect(() => {
    if (oneDayDate !== "dateEnd_oneDay" || !value || !fpRef.current) {
      return;
    }

    const forcedDate = coerceDate(value);
    if (!forcedDate) {
      return;
    }

    fpRef.current.setDate(forcedDate, false);
    const y = forcedDate.getFullYear();
    const m = String(forcedDate.getMonth() + 1).padStart(2, "0");
    const d = String(forcedDate.getDate()).padStart(2, "0");
    setSelectedDate(`${y}-${m}-${d}`);
  }, [oneDayDate, value]);

  useEffect(() => {
    const nextDate = coerceDate(defaultDate);
    if (!nextDate) {
      return;
    }

    setSelectedTime(
      `${String(nextDate.getHours()).padStart(2, "0")}:${String(nextDate.getMinutes()).padStart(2, "0")}`,
    );
  }, [defaultDate]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    onChangeRef.current(new Date(year, month - 1, day, hours, minutes));
  }, [selectedDate, selectedTime]);

  return (
    <div className="mb-4 flex flex-col md:flex-row">
      <div className={`${oneDayDate === "dateEnd_oneDay" ? "hidden" : ""} mb-5`}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative flex-2">
          <input
            ref={dateInputRef}
            type="text"
            name={id}
            id={id}
            placeholder={placeholder}
            readOnly={oneDayDate === "dateEnd_oneDay"}
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
              oneDayDate === "dateEnd_oneDay"
                ? "cursor-not-allowed border-gray-300 bg-gray-100 opacity-70 dark:bg-gray-800"
                : "border-gray-300 bg-transparent focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900"
            }`}
          />

          {selectedDate && (
            <div className="absolute -bottom-4 left-4 mt-5 flex items-center text-xs text-slate-800/80 pointer-events-none dark:text-white/30">
              {formatNiceDate(selectedDate)}
              {isSameCalendarDay(selectedDate, new Date()) && (
                <span className="ml-1 font-medium text-brand-500">( Aujourd'hui )</span>
              )}
            </div>
          )}

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <CalenderIcon className="size-6" />
          </span>
        </div>
      </div>

      {oneDayDate == "dateStart_oneDay" ? (
        <div className="ml-2 flex-1 border-gray-600 pl-2 dark:border-gray-400 md:border-l">
          {hourLabel && <Label htmlFor={hourId}>{hourLabel}</Label>}
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      ) : oneDayDate == "dateEnd_oneDay" ? (
        <div className="flex-1 ml-2 pl-2">
          {hourLabel && <Label htmlFor={hourId}>{hourLabel}</Label>}
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      ) : (
        <div className="flex-1 ml-2 border-gray-600 pl-2 dark:border-gray-400 md:border-l">
          {hourLabel && <Label htmlFor={hourId}>{hourLabel}</Label>}
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
      )}
    </div>
  );
}
