import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a LiTHePlan account to save your course profile and access it from any device. Unofficial student project for LiU students.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://litheplan.tech/signup",
  },
};

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm mode="signup" />
      </div>
    </div>
  );
}
