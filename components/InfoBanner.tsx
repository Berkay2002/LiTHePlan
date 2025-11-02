"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { GuestModeBanner } from "@/components/shared/AlertBanner";
import { createClient } from "@/utils/supabase/client";

export function InfoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Only show banner for non-authenticated users
      if (!user) {
        // Check if user has dismissed this banner before
        const dismissed = localStorage.getItem("info-banner-dismissed");
        if (!dismissed) {
          setIsVisible(true);
        }
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // Hide banner when user logs in
      if (session?.user) {
        setIsVisible(false);
      } else {
        // Show banner when user logs out (if not dismissed)
        const dismissed = localStorage.getItem("info-banner-dismissed");
        if (!dismissed) {
          setIsVisible(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("info-banner-dismissed", "true");
  };

  if (!isVisible) return null;

  return <GuestModeBanner className="mb-6" onDismiss={handleDismiss} />;
}
