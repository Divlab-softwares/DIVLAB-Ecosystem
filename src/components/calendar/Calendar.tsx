"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg, EventInput } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { CalendarPlus, ChevronRight, GraduationCap } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";

type CalendarEvent = EventInput & {
  extendedProps: {
    calendar: string;
    courseId: string;
  };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Jour local → YYYY-MM-DD (pour query et préremplissage). */
function toYmdLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Le créneau [start,end] chevauche-t-il le jour calendaire `day` (local) ? */
function overlapsCalendarDay(day: Date, start: Date, end: Date) {
  const y = day.getFullYear();
  const m = day.getMonth();
  const d = day.getDate();
  const dayStart = new Date(y, m, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m, d, 23, 59, 59, 999);
  return start.getTime() <= dayEnd.getTime() && end.getTime() >= dayStart.getTime();
}

function formatDayTitleFr(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatTimeRangeFr(start: Date, end: Date) {
  const tf = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${tf.format(start)} – ${tf.format(end)}`;
}

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [pickedDay, setPickedDay] = useState<Date | null>(null);

  const loadEvents = useCallback(async () => {
    if (!session?.user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/calendar-events", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const raw = await res.text();
      let body: { events?: CalendarEvent[]; error?: string } = {};
      try {
        body = raw ? (JSON.parse(raw) as typeof body) : {};
      } catch {
        setLoadError("Réponse serveur invalide.");
        setEvents([]);
        return;
      }

      if (!res.ok) {
        setEvents([]);
        if (res.status === 401) {
          setLoadError("Connexion requise.");
        } else {
          setLoadError(body.error || `Erreur serveur (${res.status}).`);
        }
        return;
      }

      setEvents(Array.isArray(body.events) ? body.events : []);
    } catch {
      setLoadError("Impossible de charger le calendrier.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    void loadEvents();
  }, [status, loadEvents]);

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const courseId = clickInfo.event.extendedProps.courseId as string | undefined;
      if (courseId) {
        router.push(`/course_details?courseId=${encodeURIComponent(courseId)}`);
      }
    },
    [router],
  );

  const handleDateClick = useCallback(
    (info: DateClickArg) => {
      setPickedDay(info.date);
      openModal();
    },
    [openModal],
  );

  const pickedYmd = pickedDay ? toYmdLocal(pickedDay) : null;

  const dayAgenda = useMemo(() => {
    if (!pickedDay) {
      return [];
    }
    const byCourse = new Map<
      string,
      { courseId: string; title: string; start: Date; end: Date }
    >();
    for (const ev of events) {
      const courseId = ev.extendedProps?.courseId;
      if (!courseId || !ev.start) {
        continue;
      }
      const start = new Date(ev.start as string);
      const end = ev.end ? new Date(ev.end as string) : start;
      if (!overlapsCalendarDay(pickedDay, start, end)) {
        continue;
      }
      const title = (ev.title as string) || "Formation";
      const existing = byCourse.get(courseId);
      if (!existing) {
        byCourse.set(courseId, { courseId, title, start, end });
      } else {
        if (start < existing.start) {
          existing.start = start;
        }
        if (end > existing.end) {
          existing.end = end;
        }
      }
    }
    return [...byCourse.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [pickedDay, events]);

  const isTrainer = session?.user?.role === "trainer";

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Chargement du calendrier…
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Connectez-vous pour afficher vos formations sur le calendrier.
        </p>
        <Link
          href="/signin?callbackUrl=/calendrier"
          className="mt-4 inline-block text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-white/[0.05]">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {isTrainer
            ? "Vos formations à animer : cliquez un jour pour les options, ou un créneau pour le détail."
            : "Vos formations inscrites : cliquez un jour pour la liste du jour, ou un créneau pour le détail."}
        </p>
        {loadError && <p className="mt-1 text-sm text-red-600">{loadError}</p>}
        <div className="flex flex-row gap-2 items-center">
          <ClipLoader
            color="#36d7b7"
            loading={loading}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          {loading && <p className="mt-1 text-xs text-gray-500">Mise à jour…</p>}
        </div>

      </div>
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          locale={frLocale}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={false}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          nowIndicator
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[480px] p-0 lg:max-w-[520px]"
        showCloseButton
      >
        {pickedDay && (
          <div className="flex flex-col">
            <div className="border-b border-gray-100 bg-gray-50/90 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
              <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                {formatDayTitleFr(pickedDay)}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {pickedYmd}
              </p>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
              {isTrainer && pickedYmd && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Créer
                  </p>
                  <Link
                    href={`/launch_courses?prefillDate=${encodeURIComponent(pickedYmd)}`}
                    onClick={closeModal}
                    className="flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm font-medium text-brand-800 transition hover:bg-brand-100 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200 dark:hover:bg-brand-950/50"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarPlus className="h-5 w-5 shrink-0" />
                      Nouvelle formation ce jour
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                  </Link>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Formations ce jour
                </p>
                {dayAgenda.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                    Aucun créneau prévu ce jour-là.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {dayAgenda.map((item) => (
                      <li key={item.courseId}>
                        <Link
                          href={`/course_details?courseId=${encodeURIComponent(item.courseId)}`}
                          onClick={closeModal}
                          className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left text-sm shadow-theme-xs transition hover:border-brand-200 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-brand-900/50 dark:hover:bg-brand-950/20"
                        >
                          <span className="flex min-w-0 gap-2">
                            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                            <span>
                              <span className="block font-medium text-gray-900 dark:text-white">
                                {item.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeRangeFr(item.start, item.end)}
                              </span>
                            </span>
                          </span>
                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function renderEventContent(eventInfo: EventContentArg) {
  const level = (eventInfo.event.extendedProps.calendar as string) || "Primary";
  const colorClass = `fc-bg-${level.toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} cursor-pointer rounded-sm p-1`}>
      <div className="fc-daygrid-event-dot" />
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
}

export default Calendar;
