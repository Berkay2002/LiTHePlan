// components/BackButton.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  text?: string;
  hideTextOnMobile?: boolean;
}

export function BackButton({ 
  href = "/", 
  onClick, 
  text = "Back",
  hideTextOnMobile = false
}: BackButtonProps) {
  const buttonContent = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className="h-9 px-2 sm:px-3 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <ArrowLeft className={`h-4 w-4 ${hideTextOnMobile ? '' : 'mr-2'} ${hideTextOnMobile ? 'sm:mr-2' : ''}`} />
      {hideTextOnMobile ? (
        <span className="hidden sm:inline">{text}</span>
      ) : (
        text
      )}
    </Button>
  );

  // If href is provided and no onClick, wrap in Link
  if (href && !onClick) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  // Otherwise, just return the button (with optional onClick)
  return buttonContent;
}