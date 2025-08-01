// components/ShareButtons.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Share2, Eye, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  profileId?: string;
  onViewShared?: () => void;
}

export function ShareButtons({ profileId, onViewShared }: ShareButtonsProps) {
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
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleShare}
        className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onViewShared}
        className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Eye className="h-4 w-4 mr-2" />
        View Shared
      </Button>
    </div>
  );
}