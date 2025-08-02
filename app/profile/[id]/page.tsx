// app/profile/[id]/page.tsx

"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StudentProfile } from '@/types/profile';
import { ProfilePinboard } from '@/components/profile/ProfilePinboard';
import { ProfileSummary } from '@/components/profile/ProfileSummary';
import { Navbar } from '@/components/shared/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import Link from 'next/link';
import { ProfileProvider } from '@/components/profile/ProfileContext';

function ProfilePageContent() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // For now, we'll load from localStorage since we don't have the API yet
        // In the future, this will be an API call to /api/profile/[id]
        const savedProfiles = localStorage.getItem('student_profile');
        if (savedProfiles) {
          const parsed = JSON.parse(savedProfiles);
          const loadedProfile: StudentProfile = {
            ...parsed,
            created_at: new Date(parsed.created_at),
            updated_at: new Date(parsed.updated_at)
          };
          
          // Check if this is the current user's profile or a shared one
          if (loadedProfile.id === profileId) {
            setProfile(loadedProfile);
          } else {
            // In the future, this would fetch from the API
            setError('Profile not found');
          }
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/profile/${profileId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar searchQuery="" onSearchChange={() => {}} />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md bg-card border-border shadow-lg">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold text-card-foreground mb-2">
                  Profile Not Found
                </h2>
                <p className="text-muted-foreground mb-4">
                  The profile you&apos;re looking for doesn&apos;t exist or has been removed.
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
      
      <div className="container mx-auto px-4 py-8 pt-20">
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
              <h1 className="text-2xl font-bold text-card-foreground">
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Created {profile.created_at.toLocaleDateString()} • 
                Last updated {profile.updated_at.toLocaleDateString()}
              </p>
            </div>
          </div>
          
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
        </div>

        {/* Profile Summary */}
        <div className="mb-6">
          <ProfileSummary 
            profile={profile}
          />
        </div>

        {/* Profile Pinboard (Read-only) */}
        <ProfilePinboard
          profile={profile}
          onRemoveCourse={() => {}} // Read-only for shared profiles
          onClearTerm={() => {}} // Read-only for shared profiles
          onClearProfile={() => {}} // Read-only for shared profiles
          readOnly={true}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <ProfilePageContent />
    </ProfileProvider>
  );
} 