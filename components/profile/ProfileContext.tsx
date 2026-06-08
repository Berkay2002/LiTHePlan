// components/profile/ProfileContext.tsx
"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { MasterProgramTerm } from "@/lib/profile-constants";
import { createBrowserProfilePersistence } from "@/lib/profile-persistence";
import {
  addCourseToProfile,
  clearProfile as clearProfileUtil,
  clearTermInProfile,
  moveCourseInProfile,
  removeCourseFromProfile,
} from "@/lib/profile-utils";
import {
  createEmptyProfile,
  type ProfileState,
  type StudentProfile,
} from "@/types/profile";
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
  addCourse: (course: ProfileCourse, term: MasterProgramTerm) => Promise<void>;
  clearProfile: () => Promise<void>;
  clearTerm: (term: MasterProgramTerm) => Promise<void>;
  moveCourse: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => Promise<void>;
  profileLoading: boolean;
  removeCourse: (courseId: string) => Promise<void>;
  setEditing: (isEditing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  state: ProfileState;
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
      return {
        ...state,
        current_profile: updatedProfile,
        unsaved_changes: true,
      };
    }

    case "REMOVE_COURSE": {
      if (!state.current_profile) {
        return state;
      }
      const updatedProfile = removeCourseFromProfile(
        state.current_profile,
        action.courseId
      );
      return {
        ...state,
        current_profile: updatedProfile,
        unsaved_changes: true,
      };
    }

    case "MOVE_COURSE": {
      if (!state.current_profile) {
        return state;
      }
      const movedProfile = moveCourseInProfile(
        state.current_profile,
        action.courseId,
        action.fromTerm,
        action.toTerm
      );
      return {
        ...state,
        current_profile: movedProfile,
        unsaved_changes: true,
      };
    }

    case "CLEAR_TERM": {
      if (!state.current_profile) {
        return state;
      }
      const clearedTermProfile = clearTermInProfile(
        state.current_profile,
        action.term
      );
      return {
        ...state,
        current_profile: clearedTermProfile,
        unsaved_changes: true,
      };
    }

    case "CLEAR_PROFILE": {
      if (!state.current_profile) {
        return state;
      }
      const emptyProfile = clearProfileUtil(state.current_profile);
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
  const profilePersistenceRef = useRef<ReturnType<
    typeof createBrowserProfilePersistence
  > | null>(null);
  const getProfilePersistence = useCallback(() => {
    profilePersistenceRef.current ??= createBrowserProfilePersistence();
    return profilePersistenceRef.current;
  }, []);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
  const [profileLoading, setProfileLoading] = useState(true);

  const saveProfile = async (profile: StudentProfile) => {
    await getProfilePersistence().saveProfile(profile, user);
  };

  const loadProfile = useCallback(
    () => getProfilePersistence().loadProfile(user),
    [getProfilePersistence, user]
  );

  // Load profile on mount and when authentication state changes
  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth to finish loading
    }

    const loadInitialProfile = async () => {
      const savedProfile = await loadProfile();
      if (savedProfile) {
        dispatch({ type: "LOAD_PROFILE", profile: savedProfile });
      }
      setProfileLoading(false);
    };

    loadInitialProfile();
  }, [authLoading, loadProfile]);

  useEffect(
    () =>
      getProfilePersistence().subscribeToProfileChanges(user, {
        onDelete: () => {
          // A deleted remote profile does not imply local guest state should be cleared.
        },
        onInsert: (profile) => {
          dispatch({ type: "LOAD_PROFILE", profile });
        },
        onUpdate: (profile) => {
          dispatch({ type: "LOAD_PROFILE", profile });
        },
      }),
    [getProfilePersistence, user]
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
    if (!state.current_profile) {
      return;
    }
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
    if (!state.current_profile) {
      return;
    }
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
    if (!state.current_profile) {
      return;
    }
    const updatedProfile = clearTermInProfile(state.current_profile, term);
    await saveProfile(updatedProfile);
    dispatch({ type: "LOAD_PROFILE", profile: updatedProfile });
  };

  const clearProfile = async () => {
    if (!state.current_profile) {
      return;
    }
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
    profileLoading,
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
