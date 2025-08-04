// components/ShareButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { StudentProfile } from "@/types/profile";

interface ShareButtonsProps {
  profileId?: string;
  hideTextOnMobile?: boolean;
  profile?: StudentProfile; // For cloud storage when authenticated
}

export function ShareButtons({ profileId, hideTextOnMobile = false, profile }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Handle auth state
  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleShare = async () => {
    try {
      setSaving(true);
      
      let shareableId = profileId;

      // ✨ Enhanced: Save profile to cloud and get shareable ID
      if (user && profile && !profileId) {
        try {
          // First, save the current profile to the database
          const saveResponse = await fetch('/api/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile }),
          });

          if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            shareableId = saveResult.id;
            console.log('✅ Profile saved and shareable ID obtained:', shareableId);
          } else {
            console.error('❌ Failed to save profile for sharing');
            // Try to get existing profile as fallback
            const supabase = createClient();
            const { data } = await supabase
              .from('academic_profiles')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (data) {
              shareableId = data.id;
              console.log('📦 Using existing profile ID as fallback:', shareableId);
            }
          }
        } catch (error) {
          console.error('Failed to save/get profile ID:', error);
        }
      }

      // For non-authenticated users, we share the current page URL
      // Their profile data is stored locally and will be accessible
      const url = shareableId 
        ? `${window.location.origin}/profile/${shareableId}`
        : window.location.href;
      
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Only show share button for authenticated users */}
      {user ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleShare}
          disabled={saving}
          title="Save profile to cloud and share"
          className="h-10 px-2 sm:px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : copied ? (
            <>
              <Check className={`h-4 w-4 ${hideTextOnMobile ? '' : 'mr-2'} ${hideTextOnMobile ? 'sm:mr-2' : ''}`} />
              {hideTextOnMobile ? (
                <span className="hidden sm:inline">Copied!</span>
              ) : (
                'Copied!'
              )}
            </>
          ) : (
            <>
              <Share2 className={`h-4 w-4 ${hideTextOnMobile ? '' : 'mr-2'} ${hideTextOnMobile ? 'sm:mr-2' : ''}`} />
              {hideTextOnMobile ? (
                <span className="hidden sm:inline">Share</span>
              ) : (
                'Share'
              )}
            </>
          )}
        </Button>
      ) : (
        /* Show sign up prompt for anonymous users */
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/login'}
          title="Sign up to save profiles permanently and share with others"
          className="h-10 px-2 sm:px-3 gap-1 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
        >
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Up to Share</span>
          <span className="sm:hidden">Sign Up</span>
        </Button>
      )}
    </div>
  );
}