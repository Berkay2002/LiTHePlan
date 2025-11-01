// app/profile/[id]/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import ProfilePageClient from "./ProfilePageClient";
import { ProfileDataSkeleton } from "@/components/profile/ProfileDataSkeleton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech";
  
  try {
    const { id: profileId } = await params;
    const supabase = await createClient();

    // Fetch profile to generate dynamic metadata
    const { data: profileData } = await supabase
      .from("academic_profiles")
      .select("name, profile_data, is_public")
      .eq("id", profileId)
      .single();

    // If profile not found or not public, return generic metadata with noindex
    if (!profileData || !profileData.is_public) {
      return {
        title: "Profile Not Found",
        description: "This profile does not exist or is not publicly shared.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Calculate course statistics for description
    const profile = profileData.profile_data;
    const totalCourses =
      (profile.terms?.[7]?.length || 0) +
      (profile.terms?.[8]?.length || 0) +
      (profile.terms?.[9]?.length || 0);
    const totalCredits = profile.metadata?.total_credits || 0;
    const advancedCredits = profile.metadata?.advanced_credits || 0;

    const description = `View ${profileData.name}'s master's program plan at Linköping University. ${totalCourses} courses totaling ${totalCredits}hp (${advancedCredits}hp advanced level) across terms 7-9. Created using LiTHePlan, an unofficial student tool.`;

    return {
      title: `${profileData.name} - LiU Course Profile`,
      description,
      openGraph: {
        title: `${profileData.name} - LiTHePlan Course Profile`,
        description,
        type: "website",
        images: ["/web-app-manifest-512x512.png"],
        url: `${baseUrl}/profile/${profileId}`,
      },
      twitter: {
        card: "summary",
        title: `${profileData.name} - LiU Course Profile`,
        description,
        images: ["/web-app-manifest-512x512.png"],
      },
      alternates: {
        canonical: `${baseUrl}/profile/${profileId}`,
      },
    };
  } catch (error) {
    console.error("Error generating profile metadata:", error);
    
    return {
      title: "Profile",
      description: "View a student's course profile created with LiTHePlan, an unofficial planning tool for Linköping University students",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Suspense streaming for dynamic profile data
  // Profile data fetched inside ProfilePageClient with user-specific content
  return (
    <Suspense fallback={<ProfileDataSkeleton />}>
      <ProfilePageClient params={params} />
    </Suspense>
  );
}
