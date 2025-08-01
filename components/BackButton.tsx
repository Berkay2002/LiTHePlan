// components/BackButton.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  text?: string;
}

export function BackButton({ 
  href = "/", 
  onClick, 
  text = "Back" 
}: BackButtonProps) {
  const buttonContent = (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );

  // If href is provided and no onClick, wrap in Link
  if (href && !onClick) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  // Otherwise, just return the button (with optional onClick)
  return buttonContent;
}