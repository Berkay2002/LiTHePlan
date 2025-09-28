// app/profile/edit/page.tsx

"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { DraggableTermCard } from "@/components/DraggableTermCard";
import { EditableTermCard } from "@/components/EditableTermCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileSkeletonLoader } from "@/components/ProfileSkeletonLoader";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import {
  ProfileProvider,
  useProfile,
} from "@/components/profile/ProfileContext";
import { logger } from "@/lib/logger";
import {
  IMMUTABLE_MASTER_PROGRAM_TERMS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";

const DESKTOP_BREAKPOINT = 1024;
const TERM_DROPPABLE_PATTERN = /term-(\d+)(?:-period-\d+)?$/;
const IMMUTABLE_TERM_SET = new Set<MasterProgramTerm>(
  IMMUTABLE_MASTER_PROGRAM_TERMS
);

function parseTermFromDroppableId(id: string): MasterProgramTerm | null {
  const match = TERM_DROPPABLE_PATTERN.exec(id);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1] ?? "", 10);
  return MASTER_PROGRAM_TERMS.find((term) => term === parsed) ?? null;
}

function canMoveBetweenTerms(
  source: MasterProgramTerm,
  destination: MasterProgramTerm
): boolean {
  if (source === destination) {
    return false;
  }

  return (
    !IMMUTABLE_TERM_SET.has(source) && !IMMUTABLE_TERM_SET.has(destination)
  );
}

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [showBlockTimeline, setShowBlockTimeline] = useState(true);

  // Detect if we're on mobile/tablet to disable drag and drop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

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

    const sourceTerm = parseTermFromDroppableId(source.droppableId);
    const destTerm = parseTermFromDroppableId(destination.droppableId);

    if (!(sourceTerm && destTerm)) {
      return;
    }

    // Only allow moving between terms that are not marked as immutable
    if (!canMoveBetweenTerms(sourceTerm, destTerm)) {
      return;
    }

    try {
      await moveCourse(courseId, sourceTerm, destTerm);
    } catch (error) {
      logger.error("Failed to move course:", error);
      // You could show a toast notification here
    }
  };

  const { currentProfile } = state;

  if (!currentProfile) {
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
  return (
    <ProfileProvider>
      <ProfileEditPageContent />
    </ProfileProvider>
  );
}