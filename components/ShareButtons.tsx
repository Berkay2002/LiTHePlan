// components/ShareButtons.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";

interface ShareButtonsProps {
  profileId?: string;
  hideTextOnMobile?: boolean;
  profile?: StudentProfile; // For cloud storage when authenticated
}

export function ShareButtons({ profileId, hideTextOnMobile = false, profile }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleShare = async () => {
    try {
      setSaving(true);
      
      let shareableId = profileId;

      // ✨ Enhanced: Get profile ID from cloud if authenticated and profile provided
      if (user && profile && !profileId) {
        try {
          const supabase = createClient();
          
          // Get the user's profile ID from Supabase
          const { data } = await supabase
            .from('academic_profiles')
            .select('id')
            .eq('user_id', user.sub)
            .single();
            
          if (data) {
            shareableId = data.id;
          }
        } catch (error) {
          console.error('Failed to get profile ID:', error);
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
          className="h-10 px-2 sm:px-3 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
          className="h-10 px-2 sm:px-3 gap-1"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Up to Share</span>
          <span className="sm:hidden">Sign Up</span>
        </Button>
      )}
    </div>
  );
}