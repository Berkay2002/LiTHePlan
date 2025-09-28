// components/ShareButtons.tsx
"use client";

import type { User } from "@supabase/supabase-js";
import { Check, Share2, User as UserIcon } from "lucide-react";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";

type ShareButtonsProps = {
  profileId?: string;
  hideTextOnMobile?: boolean;
  profile?: StudentProfile; // For cloud storage when authenticated
};

type ShareState = "idle" | "copied" | "error";
type ShareOutcome = "shared" | "copied" | "failed" | "aborted";

const SHARE_STATUS_RESET_DELAY_MS = 2000;
const SHARE_TITLE = "LiTHePlan Profile";
const SHARE_TEXT = "Check out this LiTHePlan study plan!";

type ShareButtonVisualState = ShareState | "saving";

const copyLinkToClipboard = async (url: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }

    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);

    const selection = document.getSelection();
    const originalRange = selection?.rangeCount
      ? selection.getRangeAt(0)
      : null;

    textArea.select();
    const successful = document.execCommand("copy");

    if (selection) {
      selection.removeAllRanges();
      if (originalRange) {
        selection.addRange(originalRange);
      }
    }

    document.body.removeChild(textArea);

    return successful;
  } catch {
    return false;
  }
};

const shareProfileUrl = async (url: string): Promise<ShareOutcome> => {
  if (navigator.share) {
    try {
      await navigator.share({
        url,
        title: SHARE_TITLE,
        text: SHARE_TEXT,
      });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "aborted";
      }
    }
  }

  const copied = await copyLinkToClipboard(url);
  return copied ? "copied" : "failed";
};

const fetchLatestProfileId = async (
  userId: string
): Promise<string | undefined> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("academic_profiles")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return;
    }

    return data?.id as string | undefined;
  } catch {
    return;
  }
};

const saveProfileForSharing = async (
  profile: StudentProfile
): Promise<string | undefined> => {
  try {
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile }),
    });

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    return typeof result.id === "string" ? result.id : undefined;
  } catch {
    return;
  }
};

const resolveShareableId = async ({
  profileId,
  profile,
  user,
}: {
  profileId?: string;
  profile?: StudentProfile;
  user: User | null;
}): Promise<string | undefined> => {
  if (profileId) {
    return profileId;
  }

  if (!(user && profile)) {
    return;
  }

  const savedId = await saveProfileForSharing(profile);
  if (savedId) {
    return savedId;
  }

  return fetchLatestProfileId(user.id);
};

const useSupabaseUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user: fetchedUser },
      } = await supabase.auth.getUser();

      if (isMounted) {
        setCurrentUser(fetchedUser ?? null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setCurrentUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return currentUser;
};

const useShareStatus = () => {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const scheduleReset = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setShareState("idle");
      timeoutRef.current = null;
    }, SHARE_STATUS_RESET_DELAY_MS);
  };

  const showSuccess = () => {
    setShareState("copied");
    scheduleReset();
  };

  const showError = () => {
    setShareState("error");
    scheduleReset();
  };

  const resetShareState = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setShareState("idle");
  };

  return { shareState, showSuccess, showError, resetShareState };
};

const getShareButtonContent = ({
  state,
  hideTextOnMobile,
}: {
  state: ShareButtonVisualState;
  hideTextOnMobile: boolean;
}): ReactElement => {
  const iconSpacingClass = `${hideTextOnMobile ? "" : "mr-2"} ${
    hideTextOnMobile ? "sm:mr-2" : ""
  }`;

  if (state === "saving") {
    return (
      <>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        Saving...
      </>
    );
  }

  if (state === "copied") {
    return (
      <>
        <Check className={`h-4 w-4 ${iconSpacingClass}`} />
        {hideTextOnMobile ? (
          <span className="hidden sm:inline">Copied!</span>
        ) : (
          "Copied!"
        )}
      </>
    );
  }

  if (state === "error") {
    return (
      <>
        <Share2 className={`h-4 w-4 ${iconSpacingClass}`} />
        {hideTextOnMobile ? (
          <span className="hidden sm:inline">Try again</span>
        ) : (
          "Try again"
        )}
      </>
    );
  }

  return (
    <>
      <Share2 className={`h-4 w-4 ${iconSpacingClass}`} />
      {hideTextOnMobile ? (
        <span className="hidden sm:inline">Share</span>
      ) : (
        "Share"
      )}
    </>
  );
};

export function ShareButtons({
  profileId,
  hideTextOnMobile = false,
  profile,
}: ShareButtonsProps) {
  const [saving, setSaving] = useState(false);
  const user = useSupabaseUser();
  const { shareState, showSuccess, showError, resetShareState } =
    useShareStatus();

  const handleShare = async () => {
    setSaving(true);
    resetShareState();

    try {
      const shareableId = await resolveShareableId({
        profileId,
        profile,
        user,
      });

      const url = shareableId
        ? `${window.location.origin}/profile/${shareableId}`
        : window.location.href;

      const outcome = await shareProfileUrl(url);

      if (outcome === "shared" || outcome === "copied") {
        showSuccess();
      } else if (outcome === "failed") {
        showError();
      }
    } catch {
      showError();
    } finally {
      setSaving(false);
    }
  };

  const buttonState: ShareButtonVisualState = saving ? "saving" : shareState;
  const buttonContent = getShareButtonContent({
    state: buttonState,
    hideTextOnMobile,
  });

  return (
    <div className="flex gap-2">
      {/* Only show share button for authenticated users */}
      {user ? (
        <Button
          className="h-10 px-2 sm:px-3 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
          disabled={saving}
          onClick={handleShare}
          size="sm"
          title="Save profile to cloud and share"
          variant="outline"
        >
          {buttonContent}
        </Button>
      ) : (
        /* Show sign up prompt for anonymous users */
        <Button
          className="h-10 px-2 sm:px-3 gap-1 bg-white/10 border-white/30 text-white hover:bg-white hover:text-air-superiority-blue-400 transition-all duration-200"
          onClick={() => {
            window.location.href = "/login";
          }}
          size="sm"
          title="Sign up to save profiles permanently and share with others"
          variant="outline"
        >
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Up to Share</span>
          <span className="sm:hidden">Sign Up</span>
        </Button>
      )}
    </div>
  );
}
