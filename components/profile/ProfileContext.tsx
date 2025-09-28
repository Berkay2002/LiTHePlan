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
  normalizeProfileData,
  removeCourseFromProfile,
  saveProfileToStorage,
} from "@/lib/profile-utils";
import { type MasterProgramTerm } from "@/lib/profile-constants";
import type { ProfileState, StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";
import { logger } from "@/lib/logger";

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
        currentProfile: action.profile,
        isEditing: false,
        unsavedChanges: false,
      };

    case "ADD_COURSE": {
      if (state.currentProfile) {
        const updatedProfile = addCourseToProfile(
          state.currentProfile,
          action.course,
          action.term
        );
        saveProfileToStorage(updatedProfile);
        return {
          ...state,
          currentProfile: updatedProfile,
          unsavedChanges: true,
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
        currentProfile: updatedProfile,
        unsavedChanges: true,
      };
    }

    case "REMOVE_COURSE": {
      if (!state.currentProfile) return state;
      const updatedProfile = removeCourseFromProfile(
        state.currentProfile,
        action.courseId
      );
      saveProfileToStorage(updatedProfile);
      return {
        ...state,
        currentProfile: updatedProfile,
        unsavedChanges: true,
      };
    }

    case "MOVE_COURSE": {
      if (!state.currentProfile) return state;
      const movedProfile = moveCourseInProfile(
        state.currentProfile,
        action.courseId,
        action.fromTerm,
        action.toTerm
      );
      saveProfileToStorage(movedProfile);
      return {
        ...state,
        currentProfile: movedProfile,
        unsavedChanges: true,
      };
    }

    case "CLEAR_TERM": {
      if (!state.currentProfile) return state;
      const clearedTermProfile = clearTermInProfile(
        state.currentProfile,
        action.term
      );
      saveProfileToStorage(clearedTermProfile);
      return {
        ...state,
        currentProfile: clearedTermProfile,
        unsavedChanges: true,
      };
    }

    case "CLEAR_PROFILE": {
      if (!state.currentProfile) return state;
      const emptyProfile = clearProfileUtil(state.currentProfile);
      saveProfileToStorage(emptyProfile);
      return {
        ...state,
        currentProfile: emptyProfile,
        unsavedChanges: true,
      };
    }

    case "SET_EDITING":
      return {
        ...state,
        isEditing: action.isEditing,
      };

    case "SET_UNSAVED_CHANGES":
      return {
        ...state,
        unsavedChanges: action.hasChanges,
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
    currentProfile: null,
    isEditing: false,
    unsavedChanges: false,
  });

  // Hybrid storage functions
  const saveProfile = async (profile: StudentProfile) => {
    if (user) {
      // Save to Supabase when authenticated - use Supabase client directly
      try {
        logger.info("🔐 Attempting to save profile for user:", {
          userId: user.id,
          userEmail: user.email,
          profileName: profile.name,
        });

        const supabase = createClient();

        // First, check if user already has a profile
        logger.info("🔍 Checking for existing profile...");
        const { data: existing, error: selectError } = await supabase
          .from("academic_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          logger.error("❌ Error checking existing profile:", selectError);
          throw selectError;
        }

        if (existing) {
          logger.info("📝 Updating existing profile:", existing.id);
          // Update existing profile
          const { error } = await supabase
            .from("academic_profiles")
            .update({
              profile_data: profile,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
          logger.info("💾 Profile updated in cloud");
        } else {
          logger.info("➕ Creating new profile...");
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
          logger.info("💾 New profile saved to cloud:", newProfile);
        }
      } catch (error) {
        logger.error(
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
          logger.error("❌ Supabase load error:", error);
          throw error;
        }

        if (data && data.length > 0) {
          const normalized = normalizeProfileData(data[0].profile_data);
          if (normalized) {
            logger.info("☁️ Loaded profile from cloud");
            return normalized;
          }
          logger.warn("⚠️ Received malformed profile data from cloud");
        }
      } catch (error) {
        logger.error(
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
      logger.info("🔄 Profile updated via Realtime:", updatedProfile);
      const normalized = normalizeProfileData(updatedProfile.profile_data);
      if (normalized) {
        dispatch({ type: "LOAD_PROFILE", profile: normalized });
      }
    },
    // onProfileInsert
    (newProfile) => {
      logger.info("➕ New profile via Realtime:", newProfile);
      const normalized = normalizeProfileData(newProfile.profile_data);
      if (normalized) {
        dispatch({ type: "LOAD_PROFILE", profile: normalized });
      }
    },
    // onProfileDelete
    (profileId) => {
      logger.info("🗑️ Profile deleted via Realtime:", profileId);
      // Could clear the current profile if it matches
    }
  );

  const addCourse = async (course: ProfileCourse, term: MasterProgramTerm) => {
    let updatedProfile: StudentProfile;

    if (state.currentProfile) {
      updatedProfile = addCourseToProfile(state.currentProfile, course, term);
    } else {
      const newProfile = createEmptyProfile();
      updatedProfile = addCourseToProfile(newProfile, course, term);
    }

    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const removeCourse = async (courseId: string) => {
    if (!state.currentProfile) return;
    const updatedProfile = removeCourseFromProfile(
      state.currentProfile,
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
    if (!state.currentProfile) return;
    const updatedProfile = moveCourseInProfile(
      state.currentProfile,
      courseId,
      fromTerm,
      toTerm
    );
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const clearTerm = async (term: MasterProgramTerm) => {
    if (!state.currentProfile) return;
    const updatedProfile = clearTermInProfile(state.currentProfile, term);
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const clearProfile = async () => {
    if (!state.currentProfile) return;
    const updatedProfile = clearProfileUtil(state.currentProfile);
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