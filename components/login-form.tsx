"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface LoginFormProps extends React.ComponentProps<"div"> {
  mode?: "login" | "signup";
}

export function LoginForm({
  className,
  mode = "login",
  ...props
}: LoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isSignup = mode === "signup";

  // Helper function to check if input is email or username
  const isEmail = (input: string): boolean =>
    input.includes("@") && input.includes(".");

  // Helper function to get email from username
  const getEmailFromUsername = async (
    username: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc("get_email_from_username", {
        input_username: username,
      });

      if (error || !data) {
        return null;
      }

      return data as string;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      let emailToUse = emailOrUsername;

      if (isSignup) {
        // For signup, emailOrUsername should be an email
        if (!isEmail(emailOrUsername)) {
          setError("Please enter a valid email address for signup");
          setLoading(false);
          return;
        }
        result = await supabase.auth.signUp({
          email: emailOrUsername,
          password,
          options: {
            data: {
              username: username || null,
            },
          },
        });
      } else {
        // For login, check if input is username or email
        if (!isEmail(emailOrUsername)) {
          // It's a username, look up the email
          const lookedUpEmail = await getEmailFromUsername(emailOrUsername);
          if (!lookedUpEmail) {
            setError("Username not found");
            setLoading(false);
            return;
          }
          emailToUse = lookedUpEmail;
        }

        result = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password,
        });
      }

      if (result.error) {
        console.error("❌ Auth error:", result.error);
        setError(result.error.message);
      } else {
        console.log("✅ Auth success:", result.data);
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 bg-popover border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8 min-h-[600px] bg-popover" onSubmit={handleSubmit}>
            <div className="flex flex-col h-full">
              {/* Main Form Content */}
              <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold text-popover-foreground">
                    {isSignup ? "Create Account" : "Welcome back"}
                  </h1>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  {isSignup && (
                    <div className="grid gap-3">
                      <Label htmlFor="username" className="text-popover-foreground">Username</Label>
                      <Input
                        className="bg-background border-border focus:ring-ring placeholder:text-popover-foreground/60"
                        disabled={loading}
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="John Doe"
                        required
                        type="text"
                        value={username}
                      />
                    </div>
                  )}
                  <div className="grid gap-3">
                    <Label htmlFor="emailOrUsername" className="text-popover-foreground">
                      {isSignup ? "Email" : "Email or Username"}
                    </Label>
                    <Input
                      className="bg-background border-border focus:ring-ring placeholder:text-popover-foreground/60"
                      disabled={loading}
                      id="emailOrUsername"
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder={
                        isSignup
                          ? "johdo123@student.liu.se"
                          : "johdo123@student.liu.se or John Doe"
                      }
                      required
                      type={isSignup ? "email" : "text"}
                      value={emailOrUsername}
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center h-5">
                      <Label htmlFor="password" className="text-popover-foreground">Password</Label>
                      {!isSignup && (
                        <a
                          className="ml-auto text-sm text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
                          href="#"
                        >
                          Forgot your password?
                        </a>
                      )}
                    </div>
                    <Input
                      className="bg-background border-border focus:ring-ring placeholder:text-popover-foreground/60"
                      disabled={loading}
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        isSignup
                          ? "Create a strong password"
                          : "Enter your password"
                      }
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                </div>

                <Button className="w-full bg-primary/10 text-popover-foreground border border-primary/20 hover:bg-primary/15 hover:border-primary/30 shadow-md hover:shadow-lg transition-all duration-200" disabled={loading} type="submit">
                  {loading
                    ? "Loading..."
                    : isSignup
                      ? "Create Account"
                      : "Sign In"}
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-popover text-popover-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <Button
                  className="w-full bg-primary/10 text-popover-foreground hover:text-popover-foreground border border-primary/20 hover:bg-primary/15 hover:border-primary/30 shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  type="button"
                  variant="outline"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-popover-foreground"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              {/* Footer Links */}
              <div className="text-center text-sm mt-6 text-popover-foreground">
                {isSignup ? (
                  <>
                    Already have an account?{" "}
                    <a className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" href="/login">
                      Sign in
                    </a>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <a className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" href="/signup">
                      Sign up
                    </a>
                  </>
                )}
              </div>
            </div>
          </form>
          <div className="bg-secondary relative hidden md:block">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <Image
                alt="Profile Builder Logo"
                className="dark:hidden opacity-90"
                height={240}
                src="/LiTHePlan-transparent.png"
                width={240}
              />
              <Image
                alt="Profile Builder Logo"
                className="hidden dark:block opacity-90"
                height={240}
                src="/LiTHePlan-white-transparent.png"
                width={240}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-balance text-popover-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors">
          Privacy Policy
        </a>.
      </div>
    </div>
  );
}
