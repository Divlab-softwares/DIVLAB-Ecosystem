"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FileText, ImageIcon, Loader2, Paperclip, Send, Video, X } from "lucide-react";
import type { RealtimeChannel } from "@supabase/supabase-js";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { CHAT_BROADCAST_EVENT } from "@@/lib/chatRealtimeTypes";
import { supabaseBrowser } from "@@/lib/createSupabaseClient";
import {
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

type Contact = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  connected?: boolean;
  role: "trainer" | "subscriber";
  channelName: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string | null;
  type: "text" | "image" | "video" | "file";
  createdAt: string;
};

function MediaBubble({ message }: { message: ChatMessage }) {
  if (!message.mediaUrl) {
    return null;
  }

  if (message.type === "image") {
    return (
      <a href={message.mediaUrl} target="_blank" rel="noreferrer">
        <img
          src={message.mediaUrl}
          alt={message.content || "Image envoyée"}
          className="max-h-72 max-w-full rounded-xl object-cover"
        />
      </a>
    );
  }

  if (message.type === "video") {
    return (
      <video
        src={message.mediaUrl}
        controls
        className="max-h-72 w-full rounded-xl bg-black"
      />
    );
  }

  return (
    <a
      href={message.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold underline-offset-4 hover:underline"
    >
      <FileText className="h-4 w-4" />
      {message.content || "Document"}
    </a>
  );
}

function contactImageSrc(image?: string | null) {
  return resolvePublicImage(image, "images", DEFAULT_PROFILE_IMAGE);
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toastError, setToastError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeContactIdRef = useRef<string | null>(null);

  const activeContact = useMemo(
    () => contacts.find((contact) => contact.id === activeContactId) ?? null,
    [activeContactId, contacts],
  );

  useEffect(() => {
    activeContactIdRef.current = activeContactId;
  }, [activeContactId]);

  useEffect(() => {
    if (!toastError) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToastError(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toastError]);

  useEffect(() => {
    fetch("/api/messages/contacts", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const nextContacts = data.contacts ?? [];
        setContacts(nextContacts);
        setActiveContactId((current) => current ?? nextContacts[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeContactId) {
      setMessages([]);
      return;
    }

    fetch(`/api/messages/thread?contactId=${encodeURIComponent(activeContactId)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => setMessages(data.messages ?? []));
  }, [activeContactId]);

  useEffect(() => {
    if (contacts.length === 0 || !session?.accessToken) {
      return undefined;
    }

    supabaseBrowser.realtime.setAuth(session.accessToken);

    const channels = Array.from(
      new Map(contacts.map((contact) => [contact.channelName, contact])).values(),
    ).map((contact) => {
      const channel = supabaseBrowser.channel(contact.channelName, {
        config: { private: true },
      });

      channel
        .on("broadcast", { event: CHAT_BROADCAST_EVENT }, ({ payload }) => {
          const incoming = payload as ChatMessage;

          const selectedContactId = activeContactIdRef.current;
          if (
            !selectedContactId ||
            (incoming.senderId !== selectedContactId && incoming.receiverId !== selectedContactId)
          ) {
            return;
          }

          setMessages((current) => {
            if (current.some((message) => message.id === incoming.id)) {
              return current;
            }

            return [...current, incoming];
          });
        })
        .subscribe();

      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        void supabaseBrowser.removeChannel(channel as RealtimeChannel);
      });
    };
  }, [contacts, session?.accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeContactId]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sending) {
      return;
    }

    if (!activeContact || (!content.trim() && !file)) {
      return;
    }

    setSending(true);
    setToastError("");

    const form = new FormData();
    form.append("receiverId", activeContact.id);
    form.append("content", content.trim());

    if (file) {
      form.append("media", file);
    }

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        body: form,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setToastError(data.error || "Message non envoyé. Veuillez réessayer.");
        return;
      }

      if (data.message) {
        const message = data.message as ChatMessage;
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current;
          }

          return [...current, message];
        });
        setContent("");
        setFile(null);
      }
    } catch (error) {
      setToastError(
        error instanceof Error
          ? error.message
          : "Message non envoyé. Veuillez réessayer.",
      );
    } finally {
      setSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Messages" />

      {toastError ? (
        <div className="fixed right-5 top-24 z-[100000] flex max-w-sm items-start gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-theme-lg dark:border-red-900/50 dark:bg-slate-900 dark:text-red-300">
          <span className="font-medium">{toastError}</span>
          <button
            type="button"
            onClick={() => setToastError("")}
            className="rounded-full p-0.5 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <section className="dashboard-panel grid min-h-[calc(100vh-190px)] overflow-hidden p-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Discussions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Contacts autorisés par abonnement actif.
            </p>
          </div>

          <div className="max-h-[72vh] overflow-y-auto p-3">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Chargement...</p>
            ) : contacts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700">
                Aucun contact disponible.
              </p>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setActiveContactId(contact.id)}
                  className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                    contact.id === activeContactId
                      ? "bg-blue-600 text-white shadow-theme-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {(() => {
                    const imageSrc = contactImageSrc(contact.image);
                    return (
                  <Image
                    width={48}
                    height={48}
                    src={imageSrc}
                    alt={contact.name}
                    unoptimized={shouldBypassNextImageCache(imageSrc)}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                    );
                  })()}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {contact.name}
                    </span>
                    <span className="block truncate text-xs opacity-75">
                      {contact.role === "trainer" ? "Formateur" : "Abonné"}
                      {contact.connected ? " - en ligne" : ""}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex min-h-[620px] flex-col bg-[linear-gradient(180deg,#f8fafc,#eef6f8)] dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
          {activeContact ? (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                {(() => {
                  const imageSrc = contactImageSrc(activeContact.image);
                  return (
                <Image
                  width={48}
                  height={48}
                  src={imageSrc}
                  alt={activeContact.name}
                  unoptimized={shouldBypassNextImageCache(imageSrc)}
                  className="h-12 w-12 rounded-full object-cover"
                />
                  );
                })()}
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    {activeContact.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeContact.connected ? "En ligne" : activeContact.email}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) => {
                  const own = message.senderId === session?.user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${own ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                          own
                            ? "rounded-br-sm bg-blue-600 text-white"
                            : "rounded-bl-sm bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <MediaBubble message={message} />
                        {message.content && message.type === "text" ? (
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {message.content}
                          </p>
                        ) : message.content && message.type !== "file" ? (
                          <p className="mt-2 text-sm leading-6">{message.content}</p>
                        ) : null}
                        <p className="mt-2 text-right text-[10px] opacity-70">
                          {new Intl.DateTimeFormat("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(message.createdAt))}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form
                ref={formRef}
                onSubmit={sendMessage}
                className="border-t border-slate-200 bg-white/95 p-3 dark:border-slate-800 dark:bg-slate-900/95"
              >
                {file ? (
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : file.type.startsWith("video/") ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {file.name}
                    <button type="button" onClick={() => setFile(null)}>
                      Retirer
                    </button>
                  </div>
                ) : null}

                <div className="flex items-end gap-2">
                  <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Paperclip className="h-5 w-5" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4,video/webm,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    rows={1}
                    placeholder="Écrire un message"
                    className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={sending || (!content.trim() && !file)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={sending ? "Envoi en cours" : "Envoyer"}
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {sending ? (
                  <p className="mt-2 text-right text-xs font-medium text-blue-600 dark:text-blue-300">
                    Envoi du message...
                  </p>
                ) : null}
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Sélectionnez une discussion pour commencer.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
