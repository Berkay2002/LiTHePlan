"use client";

import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export function InfoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Only show banner for non-authenticated users
      if (!user) {
        // Check if user has dismissed this banner before
        const dismissed = localStorage.getItem('info-banner-dismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Hide banner when user logs in
        if (session?.user) {
          setIsVisible(false);
        } else {
          // Show banner when user logs out (if not dismissed)
          const dismissed = localStorage.getItem('info-banner-dismissed');
          if (!dismissed) {
            setIsVisible(true);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('info-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm">
            <p className="text-blue-800 font-medium">
              💡 <strong>No account needed!</strong> You can build and save your course profile locally without signing up.
            </p>
            <p className="text-blue-700 mt-1">
              Sign up only if you want to save profiles permanently and share them across devices.
            </p>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-400 hover:text-blue-600 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}