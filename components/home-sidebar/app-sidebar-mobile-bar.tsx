"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LiThePlanLogo } from "@/components/LiThePlanLogo";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AppSidebarMobileBarProps {
  rightSlot?: ReactNode;
}

function MobileBrand() {
  return (
    <Link className="flex min-w-0 justify-center" href="/">
      <div className="flex min-w-0 flex-col items-center px-2 py-1">
        <LiThePlanLogo className="h-5 w-auto shrink-0" height={20} />
        <span aria-hidden="true" className="mt-1 h-px w-16 bg-border/70" />
      </div>
    </Link>
  );
}

function MobileMenuTrigger() {
  return (
    <SidebarTrigger
      className="size-10 rounded-none border-0 bg-transparent p-0 text-foreground/88 shadow-none transition-opacity duration-150 hover:bg-transparent hover:text-foreground hover:opacity-80 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:opacity-80 [&>svg]:size-6"
      size="icon-lg"
    />
  );
}

export function AppSidebarMobileBar({ rightSlot }: AppSidebarMobileBarProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-border/60 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent"
      />
      <div className="grid h-15 grid-cols-[auto_1fr_auto] items-center gap-2.5 px-4">
        <MobileMenuTrigger />
        <div className="min-w-0">
          <MobileBrand />
        </div>
        {rightSlot ?? <div />}
      </div>
    </div>
  );
}
