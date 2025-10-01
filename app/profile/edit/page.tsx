// app/profile/edit/page.tsx

"use client";

import { DragDropContext } from "@hello-pangea/dnd";
import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileSkeletonLoader } from "@/components/ProfileSkeletonLoader";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import { ProfileProvider, useProfile } from "@/components/profile/ProfileContext";
import { TermCards } from "./TermCards";
import { useMobileBreakpoint } from "./useMobileBreakpoint";
import { useProfileDragHandler } from "./useProfileDragHandler";

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [showBlockTimeline, setShowBlockTimeline] = useState(true);
  const isMobile = useMobileBreakpoint();
  const handleDragEnd = useProfileDragHandler(moveCourse);
  const { current_profile: currentProfile } = state;

  const handleToggleBlockTimeline = () => {
    setShowBlockTimeline((previous) => !previous);
  };

  if (!currentProfile) {
    return (
      <PageLayout
        navbarMode="profile-edit"
        onToggleBlockTimeline={handleToggleBlockTimeline}
        showBlockTimeline={showBlockTimeline}
      >
        <ProfileSkeletonLoader />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      navbarMode="profile-edit"
      onToggleBlockTimeline={handleToggleBlockTimeline}
      showBlockTimeline={showBlockTimeline}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <ProfileStatsCard profile={currentProfile} />
            <TermCards
              currentProfile={currentProfile}
              isMobile={isMobile}
              onClearTerm={(term) => {
                void clearTerm(term);
              }}
              onMoveCourse={(courseId, fromTerm, toTerm) => {
                void moveCourse(courseId, fromTerm, toTerm);
              }}
              onRemoveCourse={(courseId) => {
                void removeCourse(courseId);
              }}
              showBlockTimeline={showBlockTimeline}
            />
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
