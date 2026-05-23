import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://train.divlabs-tech.com";

const publicRoutes = [
  "",
  "/available_courses",
  "/signin",
  "/signup",
  "/support",
  "/subscriptions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/available_courses" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/available_courses" ? 0.9 : 0.5,
  }));
}
