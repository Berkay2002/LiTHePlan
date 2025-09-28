import localFont from "next/font/local";

// Self-host Geist fonts so builds do not rely on Google Fonts downloads.
export const geistSans = localFont({
  src: "./GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

export const geistMono = localFont({
  src: "./GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});
