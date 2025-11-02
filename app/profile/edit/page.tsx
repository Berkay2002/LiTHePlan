// app/profile/edit/page.tsx

"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { DraggableTermCard } from "@/components/DraggableTermCard";
import { EditableTermCard } from "@/components/EditableTermCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileSkeletonLoader } from "@/components/ProfileSkeletonLoader";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import { useProfile } from "@/components/profile/ProfileContext";
import {
  IMMUTABLE_MASTER_PROGRAM_TERMS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";

const DESKTOP_BREAKPOINT_PX = 1024;
const MIN_LOADING_TIME_MS = 400; // Minimum time to show skeleton for UX

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [showBlockTimeline, setShowBlockTimeline] = useState(true);

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
    const sourceTermMatch = source.droppableId.match(
      /term-(\d+)(?:-period-\d+)?$/
    );
    const destTermMatch = destination.droppableId.match(
      /term-(\d+)(?:-period-\d+)?$/
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
        navbarMode="profile-edit"
        onToggleBlockTimeline={() => setShowBlockTimeline(!showBlockTimeline)}
        showBlockTimeline={showBlockTimeline}
      >
        <ProfileSkeletonLoader />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      navbarMode="profile-edit"
      onToggleBlockTimeline={() => setShowBlockTimeline(!showBlockTimeline)}
      showBlockTimeline={showBlockTimeline}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8 space-y-8">
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
