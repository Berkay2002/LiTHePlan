// app/profile/edit/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import { BackButton } from '@/components/BackButton';
import { ShareButtons } from '@/components/ShareButtons';
import { ProfileStatsCard } from '@/components/ProfileStatsCard';
import { EditableTermCard } from '@/components/EditableTermCard';
import { DraggableTermCard } from '@/components/DraggableTermCard';
import { useProfile, ProfileProvider } from '@/components/profile/ProfileContext';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

function ProfileEditPageContent() {
  const { state, removeCourse, moveCourse, clearTerm } = useProfile();
  const [isMobile, setIsMobile] = useState(false);

  // Detect if we're on mobile/tablet to disable drag and drop
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Disable on screens smaller than desktop
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleViewShared = () => {
    if (state.current_profile) {
      window.open(`/profile/${state.current_profile.id}`, '_blank');
    }
  };

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
    
    // Extract term numbers from droppable IDs
    const sourceTermMatch = source.droppableId.match(/term-(\d+)/);
    const destTermMatch = destination.droppableId.match(/term-(\d+)/);
    
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
              <BackButton href="/" text="Back to Course Catalog" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          
          {/* Top Navigation Bar (Header) */}
          <div className="flex justify-between items-center">
            <BackButton href="/" text="Back" />
            <ShareButtons 
              profileId={state.current_profile.id} 
              onViewShared={handleViewShared} 
            />
          </div>

          {/* Middle Section: Profile Statistics Card */}
          <ProfileStatsCard profile={state.current_profile} />

          {/* Bottom Section: Term Cards (Draggable on Desktop) */}
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
                />
                <EditableTermCard 
                  termNumber={8} 
                  courses={state.current_profile.terms[8]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                />
                <EditableTermCard 
                  termNumber={9} 
                  courses={state.current_profile.terms[9]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
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
                />
                <DraggableTermCard 
                  termNumber={8} 
                  courses={state.current_profile.terms[8]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  isDragDisabled={true}
                />
                <DraggableTermCard 
                  termNumber={9} 
                  courses={state.current_profile.terms[9]}
                  onRemoveCourse={removeCourse}
                  onClearTerm={clearTerm}
                  onMoveCourse={moveCourse}
                  isDragDisabled={false}
                />
              </>
            )}
          </div>

          {/* Optional: Profile Info Footer */}
          <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
            <p>
              <strong className="text-card-foreground">{state.current_profile.name}</strong> • 
              Created {state.current_profile.created_at.toLocaleDateString()} • 
              Last updated {state.current_profile.updated_at.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}

export default function ProfileEditPage() {
  return (
    <ProfileProvider>
      <ProfileEditPageContent />
    </ProfileProvider>
  );
} 