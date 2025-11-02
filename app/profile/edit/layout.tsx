import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  description:
    "Edit your course profile and plan your master's program at Linköping University",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://litheplan.tech/profile/edit",
  },
};

export default function ProfileEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
