"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProfileStatsCard } from "@/components/ProfileStatsCard";
import { SimpleTermCard } from "@/components/SimpleTermCard";
import { Card, CardContent } from "@/components/ui/card";
import type { StudentProfile } from "@/types/profile";

export default function ProfilePageClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [profileId, setProfileId] = useState<string>("");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setProfileId(p.id));
  }, [params]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;

      try {
        setLoading(true);

        // Fetch the shared profile from Supabase API
        const response = await fetch(`/api/profile/${profileId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Profile not found");
          } else {
            setError("Failed to load profile");
          }
          return;
        }

        const profileData = await response.json();

        // Convert date strings back to Date objects if needed
        const loadedProfile: StudentProfile = {
          ...profileData,
          created_at: profileData.created_at
            ? new Date(profileData.created_at)
            : new Date(),
          updated_at: profileData.updated_at
            ? new Date(profileData.updated_at)
            : new Date(),
        };

        setProfile(loadedProfile);
        setDatabaseId(profileId);
      } catch (err) {
        setError("Failed to load profile");
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  if (loading) {
    return (
      <PageLayout navbarMode="profile-edit">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout navbarMode="profile-edit">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <Card className="w-full max-w-md bg-card border-border shadow-lg">
                <CardContent className="pt-6 text-center">
                  <h2 className="text-xl font-semibold text-card-foreground mb-2">
                    Profile Not Found
                  </h2>
                  <p className="text-muted-foreground">
                    The profile you&apos;re looking for doesn&apos;t exist or
                    has been removed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      navbarMode="profile-edit"
      profileId={databaseId || undefined}
    >
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Shared Profile Header */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-blue-800 font-medium">
                  📖 <strong>Shared Profile</strong> - You&apos;re viewing
                  someone else&apos;s course profile
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  This is a read-only view. To build your own profile,{" "}
                  <Link className="underline" href="/profile/edit">
                    click here
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Profile Statistics Card */}
          <ProfileStatsCard profile={profile} />

          {/* Term Cards (Read-only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SimpleTermCard courses={profile.terms[7]} termNumber={7} />
            <SimpleTermCard courses={profile.terms[8]} termNumber={8} />
            <SimpleTermCard courses={profile.terms[9]} termNumber={9} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
