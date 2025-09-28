import type { Metadata } from "next";
import { geistSans, geistMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech"
  ),
  title: "LiTHePlan",
  description:
    "Plan your master's program courses at Linköping University - Build unique 90hp academic profiles across different specializations",
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
    title: "LiTHePlan",
    description:
      "Plan your master's program courses at Linköping University - Build unique 90hp academic profiles across different specializations",
    images: ["/web-app-manifest-512x512.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiTHePlan",
    description:
      "Plan your master's program courses at Linköping University - Build unique 90hp academic profiles across different specializations",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
