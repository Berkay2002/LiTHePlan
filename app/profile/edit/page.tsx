// app/profile/edit/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProfileStatsCard } from '@/components/ProfileStatsCard';
import { EditableTermCard } from '@/components/EditableTermCard';
import { DraggableTermCard } from '@/components/DraggableTermCard';
import { useProfile, ProfileProvider } from '@/components/profile/ProfileContext';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

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
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);


  const handleDragEnd = (result: DropResult) => {
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
    const courseId = draggableId.split('-term')[0];
    
    // Extract term numbers from droppable IDs (now just term-X format)
    const sourceTermMatch = source.droppableId.match(/term-(\d+)(?:-period-\d+)?$/);
    const destTermMatch = destination.droppableId.match(/term-(\d+)(?:-period-\d+)?$/);
    
    if (!sourceTermMatch || !destTermMatch) {
      return;
    }

    const sourceTerm = parseInt(sourceTermMatch[1]) as 7 | 8 | 9;
    const destTerm = parseInt(destTermMatch[1]) as 7 | 8 | 9;

    // Only allow moving between terms 7 and 9 (not 8)
    if (sourceTerm === 8 || destTerm === 8) {
      return;
    }

    // Only allow moving between different terms
    if (sourceTerm !== destTerm) {
      try {
        moveCourse(courseId, sourceTerm, destTerm);
      } catch (error) {
        console.error('Failed to move course:', error);
        // You could show a toast notification here
      }
    }
  };

  if (!state.current_profile) {
    return (
      <PageLayout 
        navbarMode="profile-edit"
      >
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-card-foreground mb-2">
                  No Profile Found
                </h2>
                <p className="text-muted-foreground mb-6">
                  You need to add courses to your profile first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      navbarMode="profile-edit"
      profileId={state.current_profile.id}
      showBlockTimeline={showBlockTimeline}
      onToggleBlockTimeline={() => setShowBlockTimeline(!showBlockTimeline)}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 space-y-8">

          {/* Profile Statistics Card */}
          <ProfileStatsCard profile={state.current_profile} />

          {/* Term Cards (Draggable on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isMobile ? (
              // Use regular EditableTermCard on mobile
              <>
                <EditableTermCard 
                  termNumber={7} 
                  courses={state.current_profile.terms[7]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
                  showBlockTimeline={showBlockTimeline}
                />
                <EditableTermCard 
                  termNumber={8} 
                  courses={state.current_profile.terms[8]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  showBlockTimeline={showBlockTimeline}
                />
                <EditableTermCard 
                  termNumber={9} 
                  courses={state.current_profile.terms[9]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
                  showBlockTimeline={showBlockTimeline}
                />
              </>
            ) : (
              // Use DraggableTermCard on desktop
              <>
                <DraggableTermCard 
                  termNumber={7} 
                  courses={state.current_profile.terms[7]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
                  isDragDisabled={false}
                  showBlockTimeline={showBlockTimeline}
                />
                <DraggableTermCard 
                  termNumber={8} 
                  courses={state.current_profile.terms[8]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  isDragDisabled={true}
                  showBlockTimeline={showBlockTimeline}
                />
                <DraggableTermCard 
                  termNumber={9} 
                  courses={state.current_profile.terms[9]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
                  isDragDisabled={false}
                  showBlockTimeline={showBlockTimeline}
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