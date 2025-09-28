// app/profile/edit/page.tsx

"use client";

import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import { DraggableTermCard } from "@/components/DraggableTermCard";
import { EditableTermCard } from "@/components/EditableTermCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileSkeletonLoader } from "@/components/ProfileSkeletonLoader";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import {
  ProfileProvider,
  useProfile,
} from "@/components/profile/ProfileContext";

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [isMobile, setIsMobile] = useState(false);
  const [showBlockTimeline, setShowBlockTimeline] = useState(true);

  // Detect if we're on mobile/tablet to disable drag and drop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Disable on screens smaller than desktop
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

    const sourceTerm = Number.parseInt(sourceTermMatch[1]) as 7 | 8 | 9;
    const destTerm = Number.parseInt(destTermMatch[1]) as 7 | 8 | 9;

    // Only allow moving between terms 7 and 9 (not 8)
    if (sourceTerm === 8 || destTerm === 8) {
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

  if (!state.current_profile) {
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
            <ProfileStatsCard profile={state.current_profile} />

            {/* Term Cards (Draggable on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isMobile ? (
                // Use regular EditableTermCard on mobile
                <>
                  <EditableTermCard
                    courses={state.current_profile.terms[7]}
                    onClearTerm={clearTerm}
                    onMoveCourse={moveCourse}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={7}
                  />
                  <EditableTermCard
                    courses={state.current_profile.terms[8]}
                    onClearTerm={clearTerm}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={8}
                  />
                  <EditableTermCard
                    courses={state.current_profile.terms[9]}
                    onClearTerm={clearTerm}
                    onMoveCourse={moveCourse}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={9}
                  />
                </>
              ) : (
                // Use DraggableTermCard on desktop
                <>
                  <DraggableTermCard
                    courses={state.current_profile.terms[7]}
                    isDragDisabled={false}
                    onClearTerm={clearTerm}
                    onMoveCourse={moveCourse}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={7}
                  />
                  <DraggableTermCard
                    courses={state.current_profile.terms[8]}
                    isDragDisabled={true}
                    onClearTerm={clearTerm}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={8}
                  />
                  <DraggableTermCard
                    courses={state.current_profile.terms[9]}
                    isDragDisabled={false}
                    onClearTerm={clearTerm}
                    onMoveCourse={moveCourse}
                    onRemoveCourse={removeCourse}
                    showBlockTimeline={showBlockTimeline}
                    termNumber={9}
                  />
                </>
              )}
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
