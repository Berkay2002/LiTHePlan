// lib/profile-utils.ts

import { StudentProfile, ProfileState, createEmptyProfile, validateProfile } from '@/types/profile';

// Re-export createEmptyProfile for convenience
export { createEmptyProfile };

const PROFILE_STORAGE_KEY = 'student_profile';

/**
 * Save profile to localStorage
 */
export function saveProfileToStorage(profile: StudentProfile): void {
  try {
    const profileData = {
      ...profile,
      created_at: profile.created_at.toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  } catch (error) {
    console.error('Failed to save profile to localStorage:', error);
  }
}

/**
 * Load profile from localStorage
 */
export function loadProfileFromStorage(): StudentProfile | null {
  try {
    const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!profileData) {
      return null;
    }
    
    const parsed = JSON.parse(profileData);
    const profile: StudentProfile = {
      ...parsed,
      created_at: new Date(parsed.created_at),
      updated_at: new Date(parsed.updated_at)
    };
    
    return profile;
  } catch (error) {
    console.error('Failed to load profile from localStorage:', error);
    return null;
  }
}

/**
 * Clear profile from localStorage
 */
export function clearProfileFromStorage(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear profile from localStorage:', error);
  }
}

/**
 * Check if a course is already in the profile
 */
export function isCourseInProfile(profile: StudentProfile, courseId: string): boolean {
  return [7, 8, 9].some(term => 
    profile.terms[term as keyof typeof profile.terms].some(course => course.id === courseId)
  );
}

/**
 * Get the term where a course is located in the profile
 */
export function getCourseTermInProfile(profile: StudentProfile, courseId: string): 7 | 8 | 9 | null {
  for (const term of [7, 8, 9] as const) {
    if (profile.terms[term].some(course => course.id === courseId)) {
      return term;
    }
  }
  return null;
}

/**
 * Add a course to a specific term in the profile
 */
export function addCourseToProfile(profile: StudentProfile, course: StudentProfile['terms'][7][0], term: 7 | 8 | 9): StudentProfile {
  // Check if course is already in profile
  if (isCourseInProfile(profile, course.id)) {
    throw new Error(`Course ${course.id} is already in the profile`);
  }
  
  // Validate course is available in target term
  const isAvailableInTerm = Array.isArray(course.term) 
    ? course.term.includes(term.toString())
    : parseInt(course.term) === term;
  
  if (!isAvailableInTerm) {
    const availableTerms = Array.isArray(course.term) ? course.term.join(', ') : course.term;
    throw new Error(`Course ${course.id} is not available in term ${term}. Available in: ${availableTerms}`);
  }
  
  // Create a copy of the course with the selected term
  const courseForProfile = {
    ...course,
    term // Set the specific term this course is being added to
  };
  
  const updatedProfile: StudentProfile = {
    ...profile,
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: [...profile.terms[term], courseForProfile]
    }
  };
  
  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    total_credits: validation.total_credits,
    advanced_credits: validation.advanced_credits,
    is_valid: validation.is_valid
  };
  
  return updatedProfile;
}

/**
 * Remove a course from the profile
 */
export function removeCourseFromProfile(profile: StudentProfile, courseId: string): StudentProfile {
  const term = getCourseTermInProfile(profile, courseId);
  if (!term) {
    throw new Error(`Course ${courseId} not found in profile`);
  }
  
  const updatedProfile: StudentProfile = {
    ...profile,
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: profile.terms[term].filter(course => course.id !== courseId)
    }
  };
  
  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    total_credits: validation.total_credits,
    advanced_credits: validation.advanced_credits,
    is_valid: validation.is_valid
  };
  
  return updatedProfile;
}

/**
 * Clear all courses from a specific term
 */
export function clearTermInProfile(profile: StudentProfile, term: 7 | 8 | 9): StudentProfile {
  const updatedProfile: StudentProfile = {
    ...profile,
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: []
    }
  };
  
  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    total_credits: validation.total_credits,
    advanced_credits: validation.advanced_credits,
    is_valid: validation.is_valid
  };
  
  return updatedProfile;
}

/**
 * Clear all courses from the profile
 */
export function clearProfile(profile: StudentProfile): StudentProfile {
  const updatedProfile: StudentProfile = {
    ...profile,
    updated_at: new Date(),
    terms: {
      7: [],
      8: [],
      9: []
    },
    metadata: {
      total_credits: 0,
      advanced_credits: 0,
      is_valid: true
    }
  };
  
  return updatedProfile;
}

/**
 * Get profile summary statistics
 */
export function getProfileSummary(profile: StudentProfile) {
  const validation = validateProfile(profile);
  
  return {
    totalCourses: [7, 8, 9].reduce((sum, term) => sum + profile.terms[term as keyof typeof profile.terms].length, 0),
    totalCredits: validation.total_credits,
    advancedCredits: validation.advanced_credits,
    isComplete: validation.total_credits === 90,
    meetsAdvancedRequirement: validation.advanced_credits >= 30,
    errors: validation.errors,
    warnings: validation.warnings
  };
} 