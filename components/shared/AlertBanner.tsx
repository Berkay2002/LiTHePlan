import Link from "next/link";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

interface AlertBannerProps {
  icon?: ReactNode;
  title: string;
  description: string | ReactNode;
  variant?: "info" | "accent";
  className?: string;
}

export function AlertBanner({
  icon,
  title,
  description,
  variant = "info",
  className = "",
}: AlertBannerProps) {
  const variantStyles = {
    info: {
      container: "bg-primary/10 border-primary",
      title: "text-primary",
      description: "text-primary/90",
      iconColor: "text-primary",
    },
    accent: {
      container: "bg-accent/10 border-accent",
      title: "text-accent-foreground",
      description: "text-accent-foreground/90",
      iconColor: "text-accent",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.container} border-l-4 p-4 rounded-r-lg shadow-sm ${className}`}
    >
      <div className="flex items-start">
        {icon && (
          <div className="shrink-0">
            {typeof icon === "string" ? (
              <span className="text-lg">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}
        <div className={`${icon ? "ml-3" : ""} flex-1`}>
          <p className={`${styles.title} font-medium`}>{title}</p>
          <div className={`${styles.description} text-sm mt-1`}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SharedProfileBannerProps {
  className?: string;
}

export function SharedProfileBanner({ className }: SharedProfileBannerProps) {
  return (
    <AlertBanner
      icon="📖"
      title="Shared Profile - You're viewing someone else's course profile"
      description={
        <>
          This is a read-only view. To build your own profile,{" "}
          <Link className="underline hover:opacity-80" href="/profile/edit">
            click here
          </Link>
          .
        </>
      }
      variant="info"
      className={className}
    />
  );
}

interface GuestModeBannerProps {
  onDismiss?: () => void;
  className?: string;
}

export function GuestModeBanner({
  onDismiss,
  className,
}: GuestModeBannerProps) {
  return (
    <div className={`relative ${className || ""}`}>
      <AlertBanner
        icon={<Info className="h-5 w-5 text-accent" />}
        title="💡 No account needed! You can build and save your course profile locally without signing up."
        description="Sign up only if you want to save profiles permanently and share them across devices."
        variant="accent"
      />
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-accent hover:text-accent/80 hover:bg-accent/10 rounded-sm p-1 transition-colors"
          aria-label="Dismiss banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
