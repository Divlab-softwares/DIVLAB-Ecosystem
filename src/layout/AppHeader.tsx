"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "@@/lib/getUserInfoLib";
import LanguageToggle from "@/components/common/LanguageToggle";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useSearch } from "@/context/SearchContext";
import { useSidebar } from "@/context/SidebarContext";

const SEARCHABLE_PAGES = ["/my_courses", "/available_courses", "/courses_state"];

function SearchField({
  inputRef,
  pathname,
  searchData,
  setSearchData,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  pathname: string;
  searchData: string;
  setSearchData: (value: string) => void;
}) {
  const router = useRouter();
  const { setQuery } = useSearch();
  const { t } = useLocale();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchData(value);
    setQuery(value);

    if (!SEARCHABLE_PAGES.includes(pathname) && value.trim().length > 0) {
      router.push("/available_courses");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!SEARCHABLE_PAGES.includes(pathname) && searchData.trim().length > 0) {
        router.push("/available_courses");
      }
    }
  };

  return (
    <form>
      <div className="relative">
        <button className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <svg
            className="fill-gray-500 dark:fill-gray-400"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
              fill=""
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={searchData}
          onKeyDown={handleKeyDown}
          onChange={handleSearch}
          placeholder={t("common.search")}
          className="dark:bg-dark-900 h-11 w-full rounded-2xl border border-slate-200 bg-white/75 py-2.5 pl-12 pr-14 text-sm text-slate-800 shadow-theme-xs backdrop-blur placeholder:text-slate-400 focus:border-sky-300 focus:outline-hidden focus:ring-3 focus:ring-sky-500/10 dark:border-slate-800 dark:bg-slate-900/75 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-sky-700 xl:w-[430px]"
        />
      </div>
    </form>
  );
}

const AppHeader: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user, loading } = useAuth();
  const { query } = useSearch();
  const { t } = useLocale();
  const { isMobileOpen, toggleMobileSidebar, toggleSidebar } = useSidebar();

  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchData, setSearchData] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchData(query);
  }, [query]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
      return;
    }

    toggleMobileSidebar();
  };

  const logoPath = session?.user?.role === "trainer" ? "/" : "/my_courses";

  if (loading) {
    return (
      <header className="sticky top-0 z-99999 flex w-full border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
          <div className="flex w-full items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-3 dark:border-slate-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
            <Link href={logoPath} className="lg:hidden">
              <Image
                width={154}
                height={32}
                className="dark:hidden"
                src="./images/logo/logo.svg"
                alt="Logo"
              />
              <Image
                width={154}
                height={32}
                className="hidden dark:block"
                src="./images/logo/logo-dark.svg"
                alt="Logo"
              />
            </Link>

            <div className="hidden lg:block">
              <SearchField
                inputRef={inputRef}
                pathname={pathname}
                searchData={searchData}
                setSearchData={setSearchData}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-99999 flex w-full border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-3 dark:border-slate-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <div className="flex items-center gap-2">

            <button
              className="z-99999 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 shadow-theme-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
              onClick={handleToggle}
              aria-label={t("common.menu")}
            >
              {isMobileOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>

            <Link href={logoPath} className="lg:hidden">
              <Image
                width={154}
                height={32}
                className="dark:hidden"
                src="./images/logo/logo.svg"
                alt="Logo"
              />
              <Image
                width={154}
                height={32}
                className="hidden dark:block"
                src="./images/logo/logo-dark.svg"
                alt="Logo"
              />
            </Link>
          </div>


          <button
            title={t("common.options")}
            onClick={() => setApplicationMenuOpen((open) => !open)}
            className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <SearchField
              inputRef={inputRef}
              pathname={pathname}
              searchData={searchData}
              setSearchData={setSearchData}
            />
          </div>
        </div>

        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"
            } w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <LanguageToggle />
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          <UserDropdown
            user={user ? (user as User) : null}
            sessionUser={session?.user ? (session?.user as User) : null}
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
