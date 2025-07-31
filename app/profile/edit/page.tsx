// app/profile/edit/page.tsx

"use client";

import { useEffect, useState } from 'react';
import { StudentProfile } from '@/types/profile';
import { ProfilePinboard } from '@/components/profile/ProfilePinboard';
import { ProfileSummary } from '@/components/profile/ProfileSummary';
import { Navbar } from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Share2, Check } from 'lucide-react';
import Link from 'next/link';
import { useProfile, ProfileProvider } from '@/components/profile/ProfileContext';

function ProfileEditPageContent() {
  const { state, removeCourse, clearTerm, clearProfile } = useProfile();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!state.current_profile) return;
    
    try {
      const url = `${window.location.origin}/profile/${state.current_profile.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (!state.current_profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No Profile Found
                </h2>
                <p className="text-muted-foreground mb-4">
                  You need to add courses to your profile first.
                </p>
                <Link href="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course Catalog
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar searchQuery="" onSearchChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Catalog
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Edit Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your course selections and share your profile
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleShare} variant="outline" size="sm">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </>
              )}
            </Button>
            <Link href={`/profile/${state.current_profile.id}`}>
              <Button variant="outline" size="sm">
                View Shared Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="mb-6">
          <ProfileSummary 
            profile={state.current_profile}
            onToggleView={() => {}} // No toggle needed on edit page
            isProfileView={true}
          />
        </div>

        {/* Editable Profile Pinboard */}
        <ProfilePinboard
          profile={state.current_profile}
          onRemoveCourse={removeCourse}
          onClearTerm={clearTerm}
          onClearProfile={clearProfile}
        />
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