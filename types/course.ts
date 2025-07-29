// types/course.ts

/**
 * Course interface representing a Swedish university course
 * Used for both mock data and final schema
 */
export interface Course {
  /** Unique course identifier (e.g., 'TQXX33') */
  id: string;
  
  /** Course name in English */
  name: string;
  
  /** Number of credits (typically 30 for master's courses) */
  credits: number;
  
  /** Course level in Swedish */
  level: 'grundnivå' | 'avancerad nivå';
  
  /** Academic term (7 = first year, 8 = second year, 9 = third year) */
  term: 7 | 8 | 9;
  
  /** Period within the term (1 or 2) */
  period: 1 | 2;
  
  /** Block within the period (1-4) - single block for 100% courses, two blocks for 50% courses */
  block: number | [number, number];
  
  /** Study pace (100% = full-time, 50% = part-time) */
  pace: '100%' | '50%';
  
  /** Array of examination types (e.g., ['TEN', 'LAB', 'PROJ']) */
  examination: string[];
  
  /** Campus location or distance learning */
  campus: 'Linköping' | 'Norrköping' | 'Distans';
  
  /** Programs eligible to take this course */
  programs: string[];
}

/**
 * Type guard to validate if an object conforms to the Course interface
 */
export function isValidCourse(course: unknown): course is Course {
  if (!course || typeof course !== 'object') {
    return false;
  }
  
  const courseObj = course as Record<string, unknown>;
  
  return (
    typeof courseObj.id === 'string' &&
    typeof courseObj.name === 'string' &&
    typeof courseObj.credits === 'number' &&
    (courseObj.level === 'grundnivå' || courseObj.level === 'avancerad nivå') &&
    [7, 8, 9].includes(courseObj.term as number) &&
    [1, 2].includes(courseObj.period as number) &&
    (typeof courseObj.block === 'number' && [1, 2, 3, 4].includes(courseObj.block) || 
     (Array.isArray(courseObj.block) && courseObj.block.length === 2 && 
      courseObj.block.every(b => typeof b === 'number' && [1, 2, 3, 4].includes(b)))) &&
    (courseObj.pace === '100%' || courseObj.pace === '50%') &&
    Array.isArray(courseObj.examination) &&
    ['Linköping', 'Norrköping', 'Distans'].includes(courseObj.campus as string) &&
    Array.isArray(courseObj.programs)
  );
} 