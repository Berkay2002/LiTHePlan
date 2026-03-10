"use client";

import type { ReactNode } from "react";
import { DynamicNavbar } from "@/components/shared/DynamicNavbar";

interface MainPageLayoutProps {
  children: ReactNode;
  isMobileMenuOpen?: boolean;
  navbarMode: "main";
  onMobileMenuToggle?: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

interface ProfileEditPageLayoutProps {
  children: ReactNode;
  navbarMode: "profile-edit";
  onToggleBlockTimeline?: () => void;
  profileId?: string;
  showBlockTimeline?: boolean;
}

type PageLayoutProps = MainPageLayoutProps | ProfileEditPageLayoutProps;

export function PageLayout(props: PageLayoutProps) {
  if (props.navbarMode === "main") {
    const { navbarMode, children, ...navbarProps } = props;
    return (
      <>
        <DynamicNavbar {...navbarProps} mode={navbarMode} />
        {children}
      </>
    );
  }
  const { navbarMode, children, ...navbarProps } = props;
  return (
    <>
      <DynamicNavbar {...navbarProps} mode={navbarMode} />
      {children}
    </>
  );
}
