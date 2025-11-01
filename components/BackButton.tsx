// components/BackButton.tsx

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  href?: string;
  onClick?: () => void;
  text?: string;
  hideTextOnMobile?: boolean;
};

export function BackButton({
  href = "/",
  onClick,
  text = "Back",
  hideTextOnMobile = false,
}: BackButtonProps) {
  const buttonContent = (
    <Button
      className="h-10 px-2 sm:px-3 bg-sidebar-foreground/10 border-sidebar-foreground/40 text-sidebar-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
      onClick={onClick}
      size="sm"
      variant="outline"
    >
      <ArrowLeft
        className={`h-4 w-4 ${hideTextOnMobile ? "" : "mr-2"} ${hideTextOnMobile ? "sm:mr-2" : ""}`}
      />
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
