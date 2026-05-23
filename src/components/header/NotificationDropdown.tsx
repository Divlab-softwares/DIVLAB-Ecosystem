"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, BellDot, FileClock, MessageCircle, UserRoundPlus } from "lucide-react";
import React, { useState } from "react";

import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import {
  type AppNotification,
  useRealtimeNotifications,
} from "@/hooks/useRealtimeNotifications";
import {
  DEFAULT_PROFILE_IMAGE,
  resolvePublicImage,
  shouldBypassNextImageCache,
} from "@@/lib/imageSources";

function getNotificationIcon(type: string) {
  if (type === "message") {
    return <MessageCircle className="h-4 w-4" />;
  }

  if (type === "subscription") {
    return <UserRoundPlus className="h-4 w-4" />;
  }

  return <FileClock className="h-4 w-4" />;
}

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationRow({
  notification,
  closeDropdown,
}: {
  notification: AppNotification;
  closeDropdown: () => void;
}) {
  const href =
    notification.type === "message"
      ? "/messages"
      : notification.type === "subscription"
        ? "/subscriptions"
        : "/";

  return (
    <li>
      <DropdownItem
        tag="a"
        href={href}
        onItemClick={closeDropdown}
        className={`flex gap-3 rounded-xl border-b border-gray-100 p-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
          notification.newNotif ? "bg-blue-50/70 dark:bg-blue-500/10" : ""
        }`}
      >
        <span className="relative block h-10 w-10 shrink-0 rounded-full">
          {(() => {
            const imageSrc = resolvePublicImage(
              notification.initiator.image,
              "images",
              DEFAULT_PROFILE_IMAGE,
            );

            return (
          <Image
            width={40}
            height={40}
            src={imageSrc}
            alt={notification.initiator.name}
            unoptimized={shouldBypassNextImageCache(imageSrc)}
            className="h-10 w-10 rounded-full object-cover"
          />
            );
          })()}
          <span
            className={`absolute bottom-0 right-0 z-10 h-2.5 w-2.5 rounded-full border-[1.5px] border-white ${
              notification.initiator.connected ? "bg-success-500" : "bg-gray-400"
            } dark:border-gray-900`}
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="mb-1 block text-theme-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-white/90">
              {notification.initiator.name}
            </span>{" "}
            {notification.description}{" "}
            <span className="font-medium text-gray-800 dark:text-white/90">
              {notification.subject}
            </span>
          </span>

          <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              {getNotificationIcon(notification.type)}
              {notification.type}
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-400" />
            <span>{formatNotificationDate(notification.createdAt)}</span>
          </span>
        </span>
      </DropdownItem>
    </li>
  );
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadTotal, markAllRead } = useRealtimeNotifications();

  async function handleClick() {
    setIsOpen((open) => !open);

    if (!isOpen && unreadTotal > 0) {
      await markAllRead();
    }
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        aria-label="Notifications"
      >
        {unreadTotal > 0 ? (
          <span className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
            {unreadTotal > 9 ? "9+" : unreadTotal}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
          </span>
        ) : null}
        {unreadTotal > 0 ? <BellDot className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Messages, abonnements et journaux d'activité
            </p>
          </div>
          <button
            onClick={closeDropdown}
            className="dropdown-toggle rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            aria-label="Fermer"
          >
            x
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              Aucune notification pour le moment.
            </li>
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                closeDropdown={closeDropdown}
              />
            ))
          )}
        </ul>

        <Link
          href="/messages"
          onClick={closeDropdown}
          className="mt-3 block rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Ouvrir la messagerie
        </Link>
      </Dropdown>
    </div>
  );
}
