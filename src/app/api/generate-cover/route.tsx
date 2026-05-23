import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

type CoverVariant = "front" | "back";

function truncateText(value: string, maxLength: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > maxLength
    ? `${clean.slice(0, maxLength - 1).trim()}...`
    : clean;
}

function formatPrice(price: number, currency: string) {
  if (!Number.isFinite(price) || price <= 0) return "Gratuit";
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(price)} ${currency || "FCFA"}`;
}

function getParam(
  searchParams: URLSearchParams,
  key: string,
  fallback: string
) {
  return searchParams.get(key)?.trim() || fallback;
}

/* ------------------------------------------------------------------ */
/*  Inline SVG icon strings – no external icon lib needed              */
/* ------------------------------------------------------------------ */

/** Globe / web icon  */
const GlobeSVG = (size: number, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>`;

/** Envelope / email icon */
const MailSVG = (size: number, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>`;

/* ------------------------------------------------------------------ */
/*  Layout constants                                                   */
/* ------------------------------------------------------------------ */

const BLUE = "#2585b2";
const GOLD = "#f7bd00";
const GOLD_DARK = "#d7ab35";
const DARK = "#050505";

/* ================================================================== */
/*  FRONT COVER  (1200 × 700)                                          */
/* ================================================================== */

function FrontCover({
  title,
  description,
  date,
  language,
  instructor,
  priceLabel,
  price,
  logoUrl,
  time,
  personUrl,
}: {
  title: string;
  description: string;
  date: string;
  language: string;
  instructor: string;
  priceLabel: string;
  price: number;
  logoUrl: string;
  personUrl: string;
  time: string,
}) {
  const W = 1200;
  const H = 700;

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: BLUE,
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        color: "white",
      }}
    >
      {/* ── Decorative angled shapes ───────────────────────────── */}

      {/* Thin gold accent behind image */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 590,
          width: 190,
          height: 380,
          borderRadius: 32,
          background: GOLD,
          transform: "rotate(-7deg)",
        }}
      />

      {/* Wide warm-gold panel – right side */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 28,
          width: 350,
          height: 680,
          borderRadius: 30,
          background: GOLD_DARK,
          transform: "rotate(14deg)",
          opacity: 0.95,
        }}
      />

     
      {/* Subtle blue-on-blue top-left corner accent */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -40,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
        }}
      />

      {/* ── Instructor / person photo ───────────────────────────── */}
      <div
        style={{
          position: "absolute",
          right: 22,
          bottom: 0,
          width: 325,
          height: 630,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <img
          src={personUrl}
          width={325}
          height={630}
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* ── DIVLAB TRAIN logo + wordmark (top-left) ─────────────── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <img
          src={logoUrl}
          width={72}
          height={72}
          style={{ borderRadius: 16, objectFit: "cover" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
            gap: 2,
          }}
        >
          <span
            style={{ fontSize: 34, fontWeight: 900, letterSpacing: 1 }}
          >
            DIVLAB
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: GOLD,
              letterSpacing: 3,
            }}
          >
            TRAIN
          </span>
        </div>
      </div>

      {/* ── Main content block ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 130,
          width: 545,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 62,
            lineHeight: 1.06,
            fontWeight: 800,
            letterSpacing: -0.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            marginTop: 16,
            fontSize: 22,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.88)",
            whiteSpace: "pre-wrap",
            fontWeight: 400,
          }}
        >
          {description}
        </div>

        {/* Bullet info rows */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {(
            [
              ["Date", date],
              ["Langue", language],
              ["Formateur", instructor],
              ["Heure", time],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              {/* Filled circle bullet */}
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: DARK,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />
              <span>
                <span style={{ textDecoration: "underline" }}>{label}:</span>{" "}
                <span style={{ fontWeight: 600 }}>
                  {truncateText(value, 30)}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Price banner */}
        <div
          style={{
            marginTop: 26,
            width: 440,
            height: 88,
            display: "flex",
            alignItems: "center",
            paddingLeft: 28,
            gap: 14,
            color: DARK,
            borderRadius: "5px 44px 44px 5px",
            background:
              "linear-gradient(135deg,#ffd43b 0%,#ffb300 28%,#ffe66d 55%,#f6a600 100%)",
            clipPath: "polygon(0 0,100% 0,93% 50%,100% 100%,0 100%)",
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900 }}>{priceLabel}</span>
          {price <= 0 && (
            <span
              style={{
                marginTop: 26,
                fontSize: 20,
                fontWeight: 900,
                textDecoration: "underline",
              }}
            >
              Accès libre
            </span>
          )}
        </div>
      </div>

      {/* ── Footer contact bar ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 22,
          display: "flex",
          gap: 36,
          alignItems: "center",
          fontSize: 19,
          color: DARK,
          fontWeight: 600,
        }}
      >
        {/* Web */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {/* Globe icon – inline SVG rendered via img data-uri trick */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={DARK}
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span style={{ textDecoration: "underline" }}>
            https://train.divlabs-tech.com
          </span>
        </div>

        {/* Email */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="18"
            viewBox="0 0 24 18"
            fill="none"
            stroke={DARK}
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="1" y="1" width="22" height="16" rx="2" />
            <polyline points="1,1 12,10 23,1" />
          </svg>
          <span>divlabsoftware@gmail.com</span>
        </div>
      </div>

      {/* Subtle watermark bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          right: 22,
          fontSize: 15,
          color: "rgba(255,255,255,0.35)",
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        DIVLAB TRAIN
      </div>
    </div>
  );
}

/* ================================================================== */
/*  BACK COVER  (1600 × 1200)                                          */
/* ================================================================== */

function BackCover({
  title,
  description,
  date,
  language,
  instructor,
  priceLabel,
  price,
  logoUrl,
  personUrl,
  time,
}: {
  title: string;
  description: string;
  date: string;
  language: string;
  instructor: string;
  priceLabel: string;
  price: number;
  logoUrl: string;
  personUrl: string;
  time: string;
}) {
  const W = 1600;
  const H = 1200;

  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: BLUE,
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        color: "white",
      }}
    >
      {/* ── Decorative shapes ───────────────────────────────────── */}

      {/* Angled gold strip */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 800,
          width: 260,
          height: 580,
          borderRadius: 40,
          background: GOLD,
          transform: "rotate(-7deg)",
        }}
      />

      {/* Large warm-gold right panel */}
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 45,
          width: 620,
          height: 1160,
          borderRadius: 44,
          background: GOLD_DARK,
          transform: "rotate(14deg)",
          opacity: 0.95,
        }}
      />

      {/* Big soft circle top-left */}
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
        }}
      />

      {/* ── Person image ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          right: 36,
          bottom: 0,
          width: 550,
          height: 1100,
          display: "flex",
          borderRadius: "5px 44px 20px 5px",
          alignItems: "flex-end",
        }}
      >
        <img
          src={personUrl}
          width={550}
          height={1100}
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>

      {/* ── Logo + wordmark ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 48,
          display: "flex",
          alignItems: "center",
          gap: 22,
        }}
      >
        <img
          src={logoUrl}
          width={124}
          height={124}
          style={{ borderRadius: 22, objectFit: "cover" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
            gap: 4,
          }}
        >
          <span style={{ fontSize: 66, fontWeight: 900, letterSpacing: 1 }}>
            DIVLAB
          </span>
          <span
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: GOLD,
              letterSpacing: 3,
            }}
          >
            TRAIN
          </span>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 220,
          width: 740,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 90,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: -0.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            marginTop: 34,
            fontSize: 38,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.88)",
            whiteSpace: "pre-wrap",
            fontWeight: 400,
          }}
        >
          {description}
        </div>

        {/* Bullet info */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          {(
            [
              ["Date", date],
              ["Langue", language],
              ["Formateur", instructor],
              ["Heure", time]
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 20 }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: DARK,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <span>
                <span style={{ textDecoration: "underline" }}>{label}:</span>{" "}
                <span style={{ fontWeight: 600 }}>
                  {truncateText(value, 40)}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Price banner */}
        <div
          style={{
            marginTop: 52,
            width: 760,
            height: 170,
            display: "flex",
            alignItems: "center",
            paddingLeft: 50,
            gap: 24,
            color: DARK,
            borderRadius: "5px 44px 44px 5px",
            background:
              "linear-gradient(135deg,#ffd43b 0%,#ffb300 28%,#ffe66d 55%,#f6a600 100%)",
            clipPath: "polygon(0 0,100% 0,93% 50%,100% 100%,0 100%)",
          }}
        >
          <span style={{ fontSize: 88, fontWeight: 900 }}>{priceLabel}</span>
          {price <= 0 && (
            <span
              style={{
                marginTop: 48,
                fontSize: 32,
                fontWeight: 900,
                textDecoration: "underline",
              }}
            >
              Accès libre
            </span>
          )}
        </div>
      </div>

      {/* ── Footer contact bar ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: 44,
          display: "flex",
          gap: 80,
          alignItems: "center",
          fontSize: 28,
          color: DARK,
          fontWeight: 600,
        }}
      >
        {/* Web */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke={DARK}
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span style={{ textDecoration: "underline" }}>
            https://train.divlabs-tech.com
          </span>
        </div>

        {/* Email */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="27"
            viewBox="0 0 24 18"
            fill="none"
            stroke={DARK}
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="1" y="1" width="22" height="16" rx="2" />
            <polyline points="1,1 12,10 23,1" />
          </svg>
          <span>divlabsoftware@gmail.com</span>
        </div>
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 30,
          fontSize: 22,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 700,
          letterSpacing: 2,
        }}
      >
        DIVLAB TRAIN
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ROUTE HANDLER                                                       */
/* ================================================================== */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const variant: CoverVariant =
    searchParams.get("variant") === "back" ? "back" : "front";

  const size =
    variant === "back"
      ? { width: 1600, height: 1200 }
      : { width: 1200, height: 700 };

  /* ── shared params ─────────────────────────────────────────────── */
  const descMaxLen = variant === "back" ? 145 : 105;

  const title = truncateText(
    getParam(searchParams, "title", "Formation DIVLAB"),
    72
  );
  const description = truncateText(
    getParam(
      searchParams,
      "description",
      "Formation pratique avec projets réels, accompagnement personnalisé et débouchés concrets."
    ),
    descMaxLen
  );
  const date = getParam(searchParams, "date", "Date à définir");
  const language = getParam(searchParams, "language", "Français");
  const instructor = getParam(searchParams, "instructor", "DIVLAB Trainer");
  const currency = getParam(searchParams, "currency", "FCFA");
  const time = getParam(searchParams, "time", "10:00");
  const price = Number(searchParams.get("price") ?? "0");
  const priceLabel = formatPrice(price, currency);

  // Logo served from public folder; personUrl is passed as a query param
  const logoUrl = `${origin}/images/logo/logo.jpg`;
  const personUrl = getParam(
    searchParams,
    "personUrl",
    `${origin}/images/user/user-profile2.png`
  );

  const sharedProps = {
    title,
    description,
    date,
    language,
    instructor,
    priceLabel,
    price,
    logoUrl,
    personUrl,
    time,
  };

  return new ImageResponse(
    variant === "back" ? (
      <BackCover {...sharedProps} />
    ) : (
      <FrontCover {...sharedProps} />
    ),
    size
  );
}