// app/profile/edit/page.tsx

"use client";

import React from 'react';
import { BackButton } from '@/components/BackButton';
import { ShareButtons } from '@/components/ShareButtons';
import { ProfileStatsCard } from '@/components/ProfileStatsCard';
import { EditableTermCard } from '@/components/EditableTermCard';
import { useProfile, ProfileProvider } from '@/components/profile/ProfileContext';

function ProfileEditPageContent() {
  const { state, removeCourse, clearTerm } = useProfile();

  const handleViewShared = () => {
    if (state.current_profile) {
      window.open(`/profile/${state.current_profile.id}`, '_blank');
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

        {/* Bottom Section: Term Cards (Editable) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EditableTermCard 
            termNumber={7} 
            courses={state.current_profile.terms[7]}
            onRemoveCourse={removeCourse}
            onClearTerm={clearTerm}
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
          />
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
  );
}

export default function ProfileEditPage() {
  return (
    <ProfileProvider>
      <ProfileEditPageContent />
    </ProfileProvider>
  );
} 