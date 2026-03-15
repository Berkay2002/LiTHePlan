// app/profile/edit/page.tsx

"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DraggableTermCard } from "@/components/DraggableTermCard";
import { EditableTermCard } from "@/components/EditableTermCard";
import { ProfileEditSidebarContent } from "@/components/home-sidebar/profile-edit-sidebar-content";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileSkeletonLoader } from "@/components/ProfileSkeletonLoader";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import { useProfile } from "@/components/profile/ProfileContext";
import { ShareButtons } from "@/components/ShareButtons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import {
  IMMUTABLE_MASTER_PROGRAM_TERMS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";

const DESKTOP_BREAKPOINT_PX = 1024;
const MIN_LOADING_TIME_MS = 400; // Minimum time to show skeleton for UX
const TERM_DROPPABLE_ID_PATTERN = /term-(\d+)(?:-period-\d+)?$/;

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [showBlockTimeline, setShowBlockTimeline] = useState(true);
  const { isOpen: sidebarOpen, setIsOpen: setSidebarOpen } =
    useResponsiveSidebar();

  // Track loading state with minimum display time for better UX
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime] = useState(() => Date.now());

  // Detect if we're on mobile/tablet to disable drag and drop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT_PX); // Disable on screens smaller than desktop
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Handle minimum loading time for smooth UX
  useEffect(() => {
    if (state.current_profile && isLoading) {
      setIsLoading(false);

      // Calculate remaining time to show skeleton
      const elapsed = Date.now() - loadingStartTime;
      const remaining = Math.max(0, MIN_LOADING_TIME_MS - elapsed);

      setTimeout(() => {
        setShowLoading(false);
      }, remaining);
    }
  }, [state.current_profile, isLoading, loadingStartTime]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract course ID from draggableId (format: courseId-termX-periodY)
    const courseId = draggableId.split("-term")[0];

    // Extract term numbers from droppable IDs (now just term-X format)
    const sourceTermMatch = source.droppableId.match(TERM_DROPPABLE_ID_PATTERN);
    const destTermMatch = destination.droppableId.match(
      TERM_DROPPABLE_ID_PATTERN
    );

    if (!(sourceTermMatch && destTermMatch)) {
      return;
    }

    const parseTerm = (
      match: RegExpMatchArray | null
    ): MasterProgramTerm | null => {
      if (!match) {
        return null;
      }

      const parsed = Number.parseInt(match[1], 10);
      return MASTER_PROGRAM_TERMS.find((term) => term === parsed) ?? null;
    };

    const sourceTerm = parseTerm(sourceTermMatch);
    const destTerm = parseTerm(destTermMatch);

    if (!(sourceTerm && destTerm)) {
      return;
    }

    // Only allow moving between terms 7 and 9 (not 8)
    if (
      IMMUTABLE_MASTER_PROGRAM_TERMS.includes(sourceTerm) ||
      IMMUTABLE_MASTER_PROGRAM_TERMS.includes(destTerm)
    ) {
      return;
    }

    // Only allow moving between different terms
    if (sourceTerm !== destTerm) {
      try {
        await moveCourse(courseId, sourceTerm, destTerm);
      } catch (error) {
        console.error("Failed to move course:", error);
        // You could show a toast notification here
      }
    }
  };

  const { current_profile: currentProfile } = state;

  if (showLoading || !currentProfile) {
    return (
      <PageLayout
        onSidebarOpenChange={setSidebarOpen}
        sidebarOpen={sidebarOpen}
      >
        <ProfileSkeletonLoader />
      </PageLayout>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Edit Profile",
        item: `${baseUrl}/profile/edit`,
      },
    ],
  };

  return (
    <PageLayout
      breadcrumbs={
        <div className="container mx-auto px-4 pt-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Profile</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      }
      mobileBarRightSlot={
        <>
          <Button
            className="size-9 rounded-xl border-border/70 bg-transparent text-foreground/86 transition-colors duration-150 hover:bg-muted/38 hover:text-foreground"
            onClick={() => setShowBlockTimeline(!showBlockTimeline)}
            size="icon"
            variant="outline"
          >
            {showBlockTimeline ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
          <ShareButtons hideTextOnMobile profile={currentProfile} />
        </>
      }
      onSidebarOpenChange={setSidebarOpen}
      sidebarContent={
        <ProfileEditSidebarContent
          onToggleBlockTimeline={() => setShowBlockTimeline(!showBlockTimeline)}
          profile={currentProfile}
          showBlockTimeline={showBlockTimeline}
        />
      }
      sidebarOpen={sidebarOpen}
    >
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        type="application/ld+json"
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 pb-8 space-y-8">
            {/* Profile Statistics Card */}
            <ProfileStatsCard profile={currentProfile} />

            {/* Term Cards (Draggable on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isMobile
                ? MASTER_PROGRAM_TERMS.map((term) => {
                    const isImmutable =
                      IMMUTABLE_MASTER_PROGRAM_TERMS.includes(term);
                    return (
                      <EditableTermCard
                        courses={currentProfile.terms[term]}
                        key={term}
                        onClearTerm={clearTerm}
                        onMoveCourse={isImmutable ? undefined : moveCourse}
                        onRemoveCourse={removeCourse}
                        showBlockTimeline={showBlockTimeline}
                        termNumber={term}
                      />
                    );
                  })
                : MASTER_PROGRAM_TERMS.map((term) => {
                    const isImmutable =
                      IMMUTABLE_MASTER_PROGRAM_TERMS.includes(term);
                    return (
                      <DraggableTermCard
                        courses={currentProfile.terms[term]}
                        isDragDisabled={isImmutable}
                        key={term}
                        onClearTerm={clearTerm}
                        onMoveCourse={isImmutable ? undefined : moveCourse}
                        onRemoveCourse={removeCourse}
                        showBlockTimeline={showBlockTimeline}
                        termNumber={term}
                      />
                    );
                  })}
            </div>
          </div>
        </div>
      </DragDropContext>
    </PageLayout>
  );
}

export default function ProfileEditPage() {
  return <ProfileEditPageContent />;
}
