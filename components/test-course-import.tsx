import { Course, isValidCourse } from '@/types/course';
import mockCourses from '@/data/mock-courses.json';

export default function TestCourseImport() {
  // Validate all courses conform to the interface
  const courses: Course[] = mockCourses.filter(isValidCourse);
  
  // Validate that we can access course properties
  const firstCourse = courses[0];
  
  // Validation results
  const totalCourses = mockCourses.length;
  const validCourses = courses.length;
  const invalidCourses = totalCourses - validCourses;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Course Import Test</h2>
      <div className="text-sm space-y-2">
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-semibold text-green-800">✅ Validation Results:</p>
          <p>Total courses loaded: {totalCourses}</p>
          <p>Valid courses: {validCourses}</p>
          <p>Invalid courses: {invalidCourses}</p>
        </div>
        
        {firstCourse && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="font-semibold text-blue-800">✅ Sample Course Data:</p>
            <p>ID: {firstCourse.id}</p>
            <p>Name: {firstCourse.name}</p>
            <p>Level: {firstCourse.level}</p>
            <p>Campus: {firstCourse.campus}</p>
            <p>Credits: {firstCourse.credits}</p>
            <p>Term: {firstCourse.term}, Period: {firstCourse.period}, Block: {firstCourse.block}</p>
            <p>Pace: {firstCourse.pace}</p>
            <p>Examination: {firstCourse.examination.join(', ')}</p>
          </div>
        )}
        
        {invalidCourses > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800">⚠️ Warning:</p>
            <p>{invalidCourses} course(s) failed validation and were filtered out.</p>
          </div>
        )}
      </div>
    </div>
  );
} 