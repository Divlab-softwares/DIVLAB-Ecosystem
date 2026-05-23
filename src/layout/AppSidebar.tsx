"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { BellRing, Calendar, Home, LifeBuoy, MessageCircle, SquareUserRound, Users } from "lucide-react";
import Notification from "@/components/notification/Notification";
import { useLocale } from "@/context/LocaleContext";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PlugInIcon,
  UserCircleIcon,
} from "../icons/index";

type NavSubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: NavSubItem[];
};

const PROTECTED_PATHS = new Set([
  "/my_courses",
  "/profile",
  "/launch_courses",
  "/courses_state",
  "/audience",
  "/calendar",
  "/calendrier",
  "/messages",
  "/subscriptions",
]);

const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLocale();
  const { unreadByType } = useRealtimeNotifications();
  const {
    isExpanded,
    isHovered,
    isMobileOpen,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();

  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isAuthenticated = Boolean(session?.user?.id);
  const isNavigating = pendingPath !== null;
  const isSessionLoading = status === "loading";
  const visibleSidebar = isExpanded || isHovered || isMobileOpen;

  const closeMobileMenu = useCallback(() => {
    if (isMobileOpen) {
      setTimeout(() => toggleMobileSidebar(), 250);
    }
  }, [isMobileOpen, toggleMobileSidebar]);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);
  const getBadgeCount = useCallback(
    (path: string) => {
      if (path === "/messages") {
        return unreadByType.message ?? 0;
      }

      if (path === "/subscriptions") {
        return unreadByType.subscription ?? 0;
      }

      return 0;
    },
    [unreadByType],
  );
  const isItemActive = useCallback(
    (item: NavItem) =>
      Boolean(
        item.path
          ? isActive(item.path)
          : item.subItems?.some((subItem) => isActive(subItem.path)),
      ),
    [isActive],
  );

  const navItems = useMemo<NavItem[]>(() => {
    if (session?.user.role === "trainer") {
      return [
        {
          icon: <Home />,
          name: t("common.dashboard"),
          path: "/",
        },
        {
          icon: <GridIcon />,
          name: t("nav.courses"),
          subItems: [
            { name: t("nav.myFollowedCourses"), path: "/my_courses" },
            { name: t("nav.availableCourses"), path: "/available_courses" },
            { name: t("nav.launchCourse"), path: "/launch_courses" },
            { name: t("nav.launchedCourses"), path: "/courses_state" },
          ],
        },
        {
          icon: <UserCircleIcon />,
          name: t("common.profile"),
          path: "/profile",
        },
        {
          icon: <Calendar className="h-5 w-5" />,
          name: t("common.calendar"),
          path: "/calendrier",
        },
        {
          icon: <MessageCircle className="h-5 w-5" />,
          name: "Messages",
          path: "/messages",
        },
        {
          icon: <BellRing className="h-5 w-5" />,
          name: "Mes abonnés",
          path: "/subscriptions",
        },
        {
          name: t("nav.audience"),
          icon: <Users />,
          subItems: [{ name: t("nav.participantsByCourse"), path: "/audience" }],
        },
      ];
    }

    if (session?.user.role === "user") {
      return [
        {
          icon: <Home />,
          name: t("common.home"),
          path: "/",
        },
        {
          icon: <GridIcon />,
          name: t("nav.courses"),
          subItems: [
            { name: t("nav.myCourses"), path: "/my_courses" },
            { name: t("nav.availableCourses"), path: "/available_courses" },
          ],
        },
        {
          icon: <Calendar className="h-5 w-5" />,
          name: t("common.calendar"),
          path: "/calendrier",
        },
        {
          icon: <MessageCircle className="h-5 w-5" />,
          name: "Messages",
          path: "/messages",
        },
        {
          icon: <BellRing className="h-5 w-5" />,
          name: "Mes abonnements",
          path: "/subscriptions",
        },
        {
          icon: <UserCircleIcon />,
          name: t("nav.myProfile"),
          path: "/profile",
        },
      ];
    }

    return [
      {
        icon: <Home />,
        name: t("common.home"),
        path: "/",
      },
      {
        icon: <GridIcon />,
        name: t("nav.courses"),
        subItems: [
          { name: t("nav.myCourses"), path: "/my_courses" },
          { name: t("nav.availableCourses"), path: "/available_courses" },
        ],
      },
    ];
  }, [session?.user.role, t]);

  const othersItems = useMemo<NavItem[]>(() => {
    const baseItems: NavItem[] = [
      {
        icon: <SquareUserRound />,
        name: t("common.support"),
        path: "/support",
      },
    ];

    if (!isAuthenticated) {
      baseItems.push({
        icon: <PlugInIcon />,
        name: t("nav.authentication"),
        subItems: [
          { name: t("nav.signIn"), path: "/signin" },
          { name: t("nav.signUp"), path: "/signup" },
        ],
      });
    }

    return baseItems;
  }, [isAuthenticated, t]);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!navigationError) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setNavigationError("");
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [navigationError]);

  useEffect(() => {
    let submenuMatched = false;

    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav, index) => {
        nav.subItems?.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: menuType,
              index,
            });
            submenuMatched = true;
          }
        });
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [isActive, navItems, othersItems, pathname]);

  useEffect(() => {
    if (openSubmenu === null) {
      return;
    }

    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    const element = subMenuRefs.current[key];

    if (element) {
      setSubMenuHeight((previousHeights) => ({
        ...previousHeights,
        [key]: element.scrollHeight,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = useCallback(
    (index: number, menuType: "main" | "others") => {
      setOpenSubmenu((previousOpenSubmenu) => {
        if (
          previousOpenSubmenu &&
          previousOpenSubmenu.type === menuType &&
          previousOpenSubmenu.index === index
        ) {
          return null;
        }

        return { type: menuType, index };
      });
    },
    [],
  );

  const handleNavigation = useCallback(
    (
      event: React.MouseEvent<HTMLAnchorElement>,
      path: string,
      requiresAuth = PROTECTED_PATHS.has(path),
    ) => {
      if (isNavigating || isSessionLoading) {
        event.preventDefault();
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        event.preventDefault();
        setNavigationError(
          t("courses.navigationErrorOffline"),
        );
        return;
      }

      if (requiresAuth && !isAuthenticated) {
        event.preventDefault();
        setNavigationError(
          t("courses.navigationErrorAuth"),
        );
        setPendingPath("/signin");
        closeMobileMenu();
        router.push(`/signin?callbackUrl=${encodeURIComponent(path)}`);
        return;
      }

      if (path === pathname) {
        closeMobileMenu();
        return;
      }

      setNavigationError("");
      setPendingPath(path);
      closeMobileMenu();
    },
    [
      closeMobileMenu,
      isAuthenticated,
      isNavigating,
      isSessionLoading,
      pathname,
      router,
      t,
    ],
  );

  const renderLink = useCallback(
    (
      item: { name: string; path: string },
      className: string,
      icon?: React.ReactNode,
      isSubmenu = false,
    ) => {
      const pending = pendingPath === item.path;
      const active = isActive(item.path);
      const badgeCount = getBadgeCount(item.path);

      return (
        <Link
          href={item.path}
          onClick={(event) => handleNavigation(event, item.path)}
          aria-disabled={isNavigating || isSessionLoading}
          className={`${className} ${isNavigating || isSessionLoading ? "pointer-events-none" : ""} ${pending ? "opacity-80" : ""
            }`}
        >
          {icon ? (
            <span
              className={`${active ? "menu-item-icon-active" : "menu-item-icon-inactive"
                } ${!isExpanded || !isHovered
                  ? "mr-3"
                  : ""
                }`}
            >
              {icon}
            </span>
          ) : null}

          {!isSubmenu || isExpanded || isHovered || isMobileOpen ? (
            <span className={isSubmenu ? "" : "menu-item-text"}>{item.name}</span>
          ) : null}

          {badgeCount > 0 ? (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-white">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          ) : null}

          {pending ? (
            <span className="ml-auto flex items-center">
              <ClipLoader color="#2563eb" size={14} />
            </span>
          ) : null}
        </Link>
      );
    },
    [
      handleNavigation,
      isActive,
      isExpanded,
      isHovered,
      isMobileOpen,
      isNavigating,
      isSessionLoading,
      getBadgeCount,
      pendingPath,
    ],
  );

  const renderMenuItems = useCallback(
    (items: NavItem[], menuType: "main" | "others") => (
      <ul className="flex flex-col gap-3">
        {items.map((nav, index) => {
          const currentKey = `${menuType}-${index}`;
          const itemActive =
            openSubmenu?.type === menuType && openSubmenu?.index === index
              ? true
              : isItemActive(nav);

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  type="button"
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  disabled={isNavigating || isSessionLoading}
                  className={`menu-item group ${itemActive
                    ? "menu-item-active"
                    : "menu-item-inactive"
                    } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} ${isNavigating || isSessionLoading ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                    }`}
                  aria-expanded={openSubmenu?.type === menuType && openSubmenu?.index === index}
                >
                  <span
                    className={`${itemActive
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }  `}
                  >
                    {nav.icon}
                  </span>

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}

                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto h-5 w-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                        }`}
                    />
                  )}
                </button>
              ) : nav.path ? (
                renderLink(
                  { name: nav.name, path: nav.path },
                  `menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`,
                  nav.icon,
                )
              ) : null}

              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(element) => {
                    subMenuRefs.current[currentKey] = element;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[currentKey] ?? 0}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 ml-9 space-y-1">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        {renderLink(
                          { name: subItem.name, path: subItem.path },
                          `menu-dropdown-item ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                          }`,
                          undefined,
                          true,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    ),
    [
      handleSubmenuToggle,
      isActive,
      isExpanded,
      isHovered,
      isMobileOpen,
      isNavigating,
      isSessionLoading,
      openSubmenu,
      renderLink,
      subMenuHeight,
    ],
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(248,250,252,0.97))] px-5 text-slate-900 shadow-[18px_0_60px_rgba(15,23,42,0.08)] transition-all duration-300 ease-in-out backdrop-blur dark:border-slate-800 dark:bg-[linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.98))] lg:mt-0 ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!(isMobileOpen) ? (
          <div
            className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
          >
            <Link href="/" onClick={(event) => handleNavigation(event, "/")}>
              {isMobileOpen ? (
                <div className="flex items-center gap-2">

                </div>
              ) : (isExpanded || isHovered) && !isMobileOpen ? (

                <>
                  <Image
                    className="dark:hidden"
                    src="/images/logo/logo.svg"
                    alt="Logo"
                    width={150}
                    height={40}
                  />
                  <Image
                    className="hidden dark:block"
                    src="/images/logo/logo-dark.svg"
                    alt="Logo"
                    width={150}
                    height={40}
                  />
                </>
              ) : (
                <Image
                  src="/images/logo/logo-icon.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                />
              )}
            </Link>
          </div>) : (
          <div className="my-2">

          </div>
        )}

        <div className="mb-4">
          <div className={`rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-theme-xs dark:border-slate-800 dark:bg-slate-900/70 ${visibleSidebar ? "block" : "hidden lg:block lg:px-2 lg:py-3"}`}>
            {visibleSidebar ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      DIVLAB Train
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {session?.user?.role === "trainer" ? "Espace formateur" : "Espace apprenant"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {isSessionLoading ? t("common.loading") : "En ligne"}
                  </span>
                </div>
                <div className="rounded-2xl bg-slate-950 px-3 py-3 text-sm text-white dark:bg-white dark:text-slate-950">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4" />
                    <span className="font-medium">{t("common.support")}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/75 dark:text-slate-600">
                    Navigation centralisée, accès rapide aux formations et état de connexion plus lisible.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="rounded-2xl bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                  <LifeBuoy className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? t("common.menu") : <HorizontaLDots />}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>

              <div>
                <h2
                  className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? t("common.options") : <HorizontaLDots />}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>

          <hr className="my-1 border-t border-gray-200 dark:border-gray-800" />
        </div>
      </aside>

      {isNavigating ? (
        <div className="fixed bottom-5 right-5 z-[1000] rounded-full bg-white/90 p-3 shadow-lg ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/90 dark:ring-gray-800">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
            <ClipLoader color="#2563eb" size={18} />
            <span>{t("courses.navigationPending")}</span>
          </div>
        </div>
      ) : null}

      {navigationError ? (
        <Notification
          state="error"
          title={t("courses.navigationErrorTitle")}
          message={navigationError}
        />
      ) : null}
    </>
  );
};

export default AppSidebar;
