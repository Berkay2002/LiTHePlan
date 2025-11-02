"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sidebar-foreground text-sm">
        <span className="hidden sm:inline font-medium">
          Hi, {user.email?.split("@")[0] || `User ${user.id.slice(0, 8)}`}!
        </span>
      </div>

      <Button
        className="h-10 bg-sidebar-foreground/10 border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-foreground/20 hover:text-primary transition-all duration-200"
        onClick={handleSignOut}
        size="sm"
        variant="outline"
      >
        <LogOut className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  );
}
