// components/ShareButtons.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  profileId?: string;
  hideTextOnMobile?: boolean;
}

export function ShareButtons({ profileId, hideTextOnMobile = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = profileId 
        ? `${window.location.origin}/profile/${profileId}`
        : window.location.href;
      
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleShare}
      className="h-9 px-2 sm:px-3 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
    >
      {copied ? (
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
  );
}