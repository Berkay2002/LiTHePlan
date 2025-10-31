'use client';

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, AlertTriangle, BookOpen, GraduationCap } from "lucide-react";
import type { Course } from "@/types/course";
import { ProfileProvider, useProfile } from "@/components/profile/ProfileContext";
import { TermSelectionModal } from "@/components/course/TermSelectionModal";
import { findCourseConflicts } from "@/lib/course-conflict-utils";
import { getRelatedCourses, getLevelColor, getCampusColor, formatBlocks } from "@/lib/course-utils";
import CourseStructuredData from "@/components/seo/CourseStructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseCard } from "@/components/course/CourseCard";
import { PageLayout } from "@/components/layout/PageLayout";

interface CoursePageClientProps {
  course: Course;
  allCourses: Course[];
}

function CoursePageContent({ course, allCourses }: CoursePageClientProps) {
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useProfile();
  
  const relatedCourses = getRelatedCourses(course, allCourses, 6);
  const conflicts = state.current_profile ? findCourseConflicts(course, state.current_profile) : [];
  
  // Check if course is already in profile
  const isInProfile = state.current_profile ? Object.values(state.current_profile.terms).some((termCourses) =>
    termCourses.some((c) => c.id === course.id)
  ) : false;

  return (
    <PageLayout 
      navbarMode="main" 
      isMobileMenuOpen={false} 
      onMobileMenuToggle={() => {}}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <CourseStructuredData course={course} />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Back button */}
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Course Catalog
          </Link>

          {/* Course Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.name}</h1>
                <p className="text-xl text-muted-foreground">{course.id}</p>
              </div>
              
              <Button
                onClick={() => setIsTermModalOpen(true)}
                disabled={isInProfile}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isInProfile ? "Already in Profile" : "Add to Profile"}
              </Button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
              <Badge variant="outline" className={getCampusColor(course.campus)}>
                {course.campus}
              </Badge>
              <Badge variant="outline">
                {course.credits}hp
              </Badge>
              <Badge variant="outline">
                {course.pace}
              </Badge>
              {Array.isArray(course.term) && course.term.map((term) => (
                <Badge key={term} variant="outline">
                  Term {term}
                </Badge>
              ))}
            </div>

            {/* Conflict warning */}
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                      Course Conflicts
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      This course conflicts with {conflicts.length} course{conflicts.length > 1 ? 's' : ''} in your profile:
                      {' '}{conflicts.map(c => c.conflictingCourseId).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Course Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="font-medium">{course.credits} hp</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">{course.level}</p>
                </div>
                {course.huvudomrade && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject Area (Huvudområde)</p>
                    <p className="font-medium">{course.huvudomrade}</p>
                  </div>
                )}
                {course.examinator && (
                  <div>
                    <p className="text-sm text-muted-foreground">Examiner</p>
                    <p className="font-medium">{course.examinator}</p>
                  </div>
                )}
                {course.studierektor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Study Director</p>
                    <p className="font-medium">{course.studierektor}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Available Terms</p>
                  <p className="font-medium">
                    {Array.isArray(course.term) ? course.term.join(', ') : course.term}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {Array.isArray(course.period) ? course.period.join(', ') : course.period}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block</p>
                  <p className="font-medium">{formatBlocks(course.block)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Study Pace</p>
                  <p className="font-medium">{course.pace}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campus</p>
                  <p className="font-medium">{course.campus}</p>
                </div>
              </CardContent>
            </Card>

            {/* Examination */}
            {Array.isArray(course.examination) && course.examination.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Examination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.examination.map((exam) => {
                      const examLabels: Record<string, string> = {
                        TEN: "Written Exam",
                        LAB: "Laboratory Work",
                        PROJ: "Project",
                        SEM: "Seminar",
                        UPG: "Assignment"
                      };
                      return (
                        <Badge key={exam} variant="secondary">
                          {examLabels[exam] || exam}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Programs */}
            {Array.isArray(course.programs) && course.programs.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Available in Programs</CardTitle>
                  <CardDescription>
                    This course is available for students in the following programs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {course.programs.map((program) => (
                      <li key={program} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{program}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Notes/Restrictions */}
            {course.notes && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{course.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCourses.map((relatedCourse) => (
                  <Link key={relatedCourse.id} href={`/course/${relatedCourse.id}`}>
                    <CourseCard course={relatedCourse} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Term Selection Modal */}
      <TermSelectionModal
        course={course}
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        availableTerms={course.term.map(t => Number.parseInt(t, 10) as 7 | 8 | 9)}
        onTermSelected={() => setIsTermModalOpen(false)}
      />
    </PageLayout>
  );
}

export default function CoursePageClient(props: CoursePageClientProps) {
  return (
    <ProfileProvider>
      <CoursePageContent {...props} />
    </ProfileProvider>
  );
}
