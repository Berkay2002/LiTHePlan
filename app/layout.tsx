import type { Metadata } from "next";
import { geistSans, geistMono } from "./fonts";
import StructuredData from "@/components/seo/StructuredData";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech"
  ),
  title: {
    template: "%s | LiTHePlan",
    default: "LiTHePlan - Plan Your Master's Courses at Linköping University",
  },
  description:
    "Unofficial student-created course planning tool for Linköping University students. Explore 339 curated master's courses, build your 90hp profile, and validate degree requirements. Not affiliated with LiU.",
  keywords: [
    "Linköping University",
    "LiU",
    "course planner",
    "master program",
    "civilingenjör",
    "course planning",
    "academic profile",
    "engineering courses",
    "Sweden university",
  ],
  authors: [{ name: "LiTHePlan Team" }],
  alternates: {
    canonical: "https://litheplan.tech",
  },
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon1.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/icon0.svg", color: "#60b2e5" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "LiTHePlan - Unofficial Course Planner for Linköping University",
    description:
      "Unofficial student-created course planning tool for Linköping University students. Explore 339 curated master's courses, build your 90hp profile, and validate degree requirements. Not affiliated with LiU.",
    images: ["/web-app-manifest-512x512.png"],
    type: "website",
    locale: "en_US",
    siteName: "LiTHePlan",
    url: "https://litheplan.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiTHePlan - Unofficial Course Planner for Linköping University",
    description:
      "Unofficial student-created course planning tool for Linköping University students. Explore 339 curated courses, build your 90hp profile. Not affiliated with LiU.",
    images: ["/web-app-manifest-512x512.png"],
  },
  other: {
    "msapplication-TileColor": "#60b2e5",
    "msapplication-TileImage": "/web-app-manifest-192x192.png",
    "theme-color": "#60b2e5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
