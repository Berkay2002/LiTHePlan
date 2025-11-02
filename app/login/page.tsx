import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to LiTHePlan to save and sync your course profile across devices. Unofficial student project for LiU students.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://litheplan.tech/login",
  },
};

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm mode="login" />
      </div>
    </div>
  );
}
