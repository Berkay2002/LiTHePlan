// components/profile/ProfileContext.tsx
"use client";

import type { User } from "@supabase/supabase-js";
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useRealtimeProfiles } from "@/hooks/useRealtimeProfiles";
import {
  addCourseToProfile,
  clearProfile as clearProfileUtil,
  clearTermInProfile,
  createEmptyProfile,
  loadProfileFromStorage,
  moveCourseInProfile,
  removeCourseFromProfile,
  saveProfileToStorage,
} from "@/lib/profile-utils";
import { type MasterProgramTerm } from "@/lib/profile-constants";
import type { ProfileState, StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";

type ProfileCourse = StudentProfile["terms"][MasterProgramTerm][number];

type ProfileAction =
  | { type: "LOAD_PROFILE"; profile: StudentProfile }
  | {
      type: "ADD_COURSE";
      course: ProfileCourse;
      term: MasterProgramTerm;
    }
  | { type: "REMOVE_COURSE"; courseId: string }
  | {
      type: "MOVE_COURSE";
      courseId: string;
      fromTerm: MasterProgramTerm;
      toTerm: MasterProgramTerm;
    }
  | { type: "CLEAR_TERM"; term: MasterProgramTerm }
  | { type: "CLEAR_PROFILE" }
  | { type: "SET_EDITING"; isEditing: boolean }
  | { type: "SET_UNSAVED_CHANGES"; hasChanges: boolean };

interface ProfileContextType {
  state: ProfileState;
  addCourse: (
    course: ProfileCourse,
    term: MasterProgramTerm
  ) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  moveCourse: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => Promise<void>;
  clearTerm: (term: MasterProgramTerm) => Promise<void>;
  clearProfile: () => Promise<void>;
  setEditing: (isEditing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function profileReducer(
  state: ProfileState,
  action: ProfileAction
): ProfileState {
  switch (action.type) {
    case "LOAD_PROFILE":
      return {
        ...state,
        current_profile: action.profile,
        is_editing: false,
        unsaved_changes: false,
      };

    case "ADD_COURSE": {
      if (state.current_profile) {
        const updatedProfile = addCourseToProfile(
          state.current_profile,
          action.course,
          action.term
        );
        saveProfileToStorage(updatedProfile);
        return {
          ...state,
          current_profile: updatedProfile,
          unsaved_changes: true,
        };
      }
      const newProfile = createEmptyProfile();
      const updatedProfile = addCourseToProfile(
        newProfile,
        action.course,
        action.term
      );
      saveProfileToStorage(updatedProfile);
      return {
        ...state,
        current_profile: updatedProfile,
        unsaved_changes: true,
      };
    }

    case "REMOVE_COURSE": {
      if (!state.current_profile) return state;
      const updatedProfile = removeCourseFromProfile(
        state.current_profile,
        action.courseId
      );
      saveProfileToStorage(updatedProfile);
      return {
        ...state,
        current_profile: updatedProfile,
        unsaved_changes: true,
      };
    }

    case "MOVE_COURSE": {
      if (!state.current_profile) return state;
      const movedProfile = moveCourseInProfile(
        state.current_profile,
        action.courseId,
        action.fromTerm,
        action.toTerm
      );
      saveProfileToStorage(movedProfile);
      return {
        ...state,
        current_profile: movedProfile,
        unsaved_changes: true,
      };
    }

    case "CLEAR_TERM": {
      if (!state.current_profile) return state;
      const clearedTermProfile = clearTermInProfile(
        state.current_profile,
        action.term
      );
      saveProfileToStorage(clearedTermProfile);
      return {
        ...state,
        current_profile: clearedTermProfile,
        unsaved_changes: true,
      };
    }

    case "CLEAR_PROFILE": {
      if (!state.current_profile) return state;
      const emptyProfile = clearProfileUtil(state.current_profile);
      saveProfileToStorage(emptyProfile);
      return {
        ...state,
        current_profile: emptyProfile,
        unsaved_changes: true,
      };
    }

    case "SET_EDITING":
      return {
        ...state,
        is_editing: action.isEditing,
      };

    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        unsaved_changes: action.hasChanges,
      };

    default:
      return state;
  }
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Handle auth state
  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setAuthLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [state, dispatch] = useReducer(profileReducer, {
    current_profile: null,
    is_editing: false,
    unsaved_changes: false,
  });

  // Hybrid storage functions
  const saveProfile = async (profile: StudentProfile) => {
    if (user) {
      // Save to Supabase when authenticated - use Supabase client directly
      try {
        console.log("🔐 Attempting to save profile for user:", {
          userId: user.id,
          userEmail: user.email,
          profileName: profile.name,
        });

        const supabase = createClient();

        // First, check if user already has a profile
        console.log("🔍 Checking for existing profile...");
        const { data: existing, error: selectError } = await supabase
          .from("academic_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          console.error("❌ Error checking existing profile:", selectError);
          throw selectError;
        }

        if (existing) {
          console.log("📝 Updating existing profile:", existing.id);
          // Update existing profile
          const { error } = await supabase
            .from("academic_profiles")
            .update({
              profile_data: profile,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
          console.log("💾 Profile updated in cloud");
        } else {
          console.log("➕ Creating new profile...");
          // Create new profile
          const { data: newProfile, error } = await supabase
            .from("academic_profiles")
            .insert({
              user_id: user.id,
              name: profile.name || "My Course Profile",
              profile_data: profile,
              is_public: true,
            })
            .select()
            .single();

          if (error) throw error;
          console.log("💾 New profile saved to cloud:", newProfile);
        }
      } catch (error) {
        console.error(
          "❌ Failed to save to cloud, falling back to localStorage:",
          error
        );
        saveProfileToStorage(profile);
      }
    } else {
      // Save to localStorage when not authenticated
      saveProfileToStorage(profile);
    }
  };

  const loadProfile = useCallback(async () => {
    if (user) {
      // Load from Supabase when authenticated - use Supabase client directly
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("academic_profiles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Supabase load error:", error);
          throw error;
        }

        if (data && data.length > 0) {
          const latestProfile = data[0].profile_data; // Get most recent profile
          console.log("☁️ Loaded profile from cloud");
          return latestProfile;
        }
      } catch (error) {
        console.error(
          "❌ Failed to load from cloud, falling back to localStorage:",
          error
        );
      }
    }

    // Fallback to localStorage (for non-authenticated users or cloud failure)
    return loadProfileFromStorage();
  }, [user]);

  // Load profile on mount and when authentication state changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading

    const loadInitialProfile = async () => {
      const savedProfile = await loadProfile();
      if (savedProfile) {
        dispatch({ type: "LOAD_PROFILE", profile: savedProfile });
      }
    };

    loadInitialProfile();
  }, [user, authLoading, loadProfile]);

  // Set up Realtime subscriptions for authenticated users
  useRealtimeProfiles(
    user,
    // onProfileUpdate
    (updatedProfile) => {
      console.log("🔄 Profile updated via Realtime:", updatedProfile);
      dispatch({ type: "LOAD_PROFILE", profile: updatedProfile.profile_data });
    },
    // onProfileInsert
    (newProfile) => {
      console.log("➕ New profile via Realtime:", newProfile);
      dispatch({ type: "LOAD_PROFILE", profile: newProfile.profile_data });
    },
    // onProfileDelete
    (profileId) => {
      console.log("🗑️ Profile deleted via Realtime:", profileId);
      // Could clear the current profile if it matches
    }
  );

  const addCourse = async (course: ProfileCourse, term: MasterProgramTerm) => {
    let updatedProfile: StudentProfile;

    if (state.current_profile) {
      updatedProfile = addCourseToProfile(state.current_profile, course, term);
    } else {
      const newProfile = createEmptyProfile();
      updatedProfile = addCourseToProfile(newProfile, course, term);
    }

    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const removeCourse = async (courseId: string) => {
    if (!state.current_profile) return;
    const updatedProfile = removeCourseFromProfile(
      state.current_profile,
      courseId
    );
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const moveCourse = async (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => {
    if (!state.current_profile) return;
    const updatedProfile = moveCourseInProfile(
      state.current_profile,
      courseId,
      fromTerm,
      toTerm
    );
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const clearTerm = async (term: MasterProgramTerm) => {
    if (!state.current_profile) return;
    const updatedProfile = clearTermInProfile(state.current_profile, term);
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const clearProfile = async () => {
    if (!state.current_profile) return;
    const updatedProfile = clearProfileUtil(state.current_profile);
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const setEditing = (isEditing: boolean) => {
    dispatch({ type: "SET_EDITING", isEditing });
  };

  const setUnsavedChanges = (hasChanges: boolean) => {
    dispatch({ type: "SET_UNSAVED_CHANGES", hasChanges });
  };

  const value: ProfileContextType = {
    state,
    addCourse,
    removeCourse,
    moveCourse,
    clearTerm,
    clearProfile,
    setEditing,
    setUnsavedChanges,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

export function useProfileSafe() {
  const context = useContext(ProfileContext);
  return context || null;
}
