"use client";

import { ReactNode } from "react";
import { DynamicNavbar } from "@/components/shared/DynamicNavbar";

interface MainPageLayoutProps {
  children: ReactNode;
  navbarMode: 'main';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface ProfileEditPageLayoutProps {
  children: ReactNode;
  navbarMode: 'profile-edit';
  profileId?: string;
  showBlockTimeline?: boolean;
  onToggleBlockTimeline?: () => void;
}

type PageLayoutProps = MainPageLayoutProps | ProfileEditPageLayoutProps;

export function PageLayout(props: PageLayoutProps) {
  return (
    <>
      <DynamicNavbar {...props} mode={props.navbarMode} />
      {props.children}
    </>
  );
}