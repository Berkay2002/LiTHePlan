// components/profile/ProfileContext.tsx

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { StudentProfile, ProfileState } from '@/types/profile';
import { 
  loadProfileFromStorage, 
  saveProfileToStorage, 
  addCourseToProfile, 
  removeCourseFromProfile, 
  clearTermInProfile, 
  clearProfile as clearProfileUtil,
  createEmptyProfile 
} from '@/lib/profile-utils';

type ProfileAction = 
  | { type: 'LOAD_PROFILE'; profile: StudentProfile }
  | { type: 'ADD_COURSE'; course: StudentProfile['terms'][7][0]; term: 7 | 8 | 9 }
  | { type: 'REMOVE_COURSE'; courseId: string }
  | { type: 'CLEAR_TERM'; term: 7 | 8 | 9 }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'SET_EDITING'; isEditing: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; hasChanges: boolean };

interface ProfileContextType {
  state: ProfileState;
  addCourse: (course: StudentProfile['terms'][7][0], term: 7 | 8 | 9) => void;
  removeCourse: (courseId: string) => void;
  clearTerm: (term: 7 | 8 | 9) => void;
  clearProfile: () => void;
  setEditing: (isEditing: boolean) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'LOAD_PROFILE':
      return {
        ...state,
        current_profile: action.profile,
        is_editing: false,
        unsaved_changes: false
      };
    
    case 'ADD_COURSE':
      if (!state.current_profile) {
        const newProfile = createEmptyProfile();
        const updatedProfile = addCourseToProfile(newProfile, action.course, action.term);
        saveProfileToStorage(updatedProfile);
        return {
          ...state,
          current_profile: updatedProfile,
          unsaved_changes: true
        };
      } else {
        const updatedProfile = addCourseToProfile(state.current_profile, action.course, action.term);
        saveProfileToStorage(updatedProfile);
        return {
          ...state,
          current_profile: updatedProfile,
          unsaved_changes: true
        };
      }
    
    case 'REMOVE_COURSE':
      if (!state.current_profile) return state;
      const updatedProfile = removeCourseFromProfile(state.current_profile, action.courseId);
      saveProfileToStorage(updatedProfile);
      return {
        ...state,
        current_profile: updatedProfile,
        unsaved_changes: true
      };
    
    case 'CLEAR_TERM':
      if (!state.current_profile) return state;
      const clearedTermProfile = clearTermInProfile(state.current_profile, action.term);
      saveProfileToStorage(clearedTermProfile);
      return {
        ...state,
        current_profile: clearedTermProfile,
        unsaved_changes: true
      };
    
    case 'CLEAR_PROFILE':
      if (!state.current_profile) return state;
      const emptyProfile = clearProfileUtil(state.current_profile);
      saveProfileToStorage(emptyProfile);
      return {
        ...state,
        current_profile: emptyProfile,
        unsaved_changes: true
      };
    
    case 'SET_EDITING':
      return {
        ...state,
        is_editing: action.isEditing
      };
    
    case 'SET_UNSAVED_CHANGES':
      return {
        ...state,
        unsaved_changes: action.hasChanges
      };
    
    default:
      return state;
  }
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, {
    current_profile: null,
    is_editing: false,
    unsaved_changes: false
  });

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = loadProfileFromStorage();
    if (savedProfile) {
      dispatch({ type: 'LOAD_PROFILE', profile: savedProfile });
    }
  }, []);

  const addCourse = (course: StudentProfile['terms'][7][0], term: 7 | 8 | 9) => {
    dispatch({ type: 'ADD_COURSE', course, term });
  };

  const removeCourse = (courseId: string) => {
    dispatch({ type: 'REMOVE_COURSE', courseId });
  };

  const clearTerm = (term: 7 | 8 | 9) => {
    dispatch({ type: 'CLEAR_TERM', term });
  };

  const clearProfile = () => {
    dispatch({ type: 'CLEAR_PROFILE' });
  };

  const setEditing = (isEditing: boolean) => {
    dispatch({ type: 'SET_EDITING', isEditing });
  };

  const setUnsavedChanges = (hasChanges: boolean) => {
    dispatch({ type: 'SET_UNSAVED_CHANGES', hasChanges });
  };

  const value: ProfileContextType = {
    state,
    addCourse,
    removeCourse,
    clearTerm,
    clearProfile,
    setEditing,
    setUnsavedChanges
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 