'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronUp, Plus, AlertTriangle, BookOpen, GraduationCap, ExternalLink } from "lucide-react";
import type { Course } from "@/types/course";
import { useProfile } from "@/components/profile/ProfileContext";
import { TermSelectionModal } from "@/components/course/TermSelectionModal";
import { findCourseConflicts } from "@/lib/course-conflict-utils";
import { fetchRelatedCourses, formatBlocks } from "@/lib/course-utils";
import CourseStructuredData from "@/components/seo/CourseStructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { PageLayout } from "@/components/layout/PageLayout";
import { CourseHero } from "@/components/course/CourseHero";
import { CourseMetadataRow } from "@/components/course/CourseMetadataRow";
import { ExaminationBadges } from "@/components/course/ExaminationBadges";
import { ProgramsList } from "@/components/course/ProgramsList";

interface CoursePageClientProps {
  course: Course;
}

function CoursePageContent({ course }: CoursePageClientProps) {
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const { state, addCourse } = useProfile();
  
  const conflicts = state.current_profile ? findCourseConflicts(course, state.current_profile) : [];
  
  // Check if course is already in profile
  const isInProfile = state.current_profile ? Object.values(state.current_profile.terms).some((termCourses) =>
    termCourses.some((c) => c.id === course.id)
  ) : false;

  // Fetch related courses from API
  useEffect(() => {
    const loadRelatedCourses = async () => {
      setIsLoadingRelated(true);
      const courses = await fetchRelatedCourses(course.id);
      setRelatedCourses(courses);
      setIsLoadingRelated(false);
    };

    loadRelatedCourses();
  }, [course.id]);

  // Scroll to top handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle term selection from modal
  const handleTermSelected = async (selectedCourse: Course, selectedTerm: 7 | 8 | 9) => {
    console.log('🔄 Term selected:', selectedTerm, 'for course:', selectedCourse.id);
    setIsTermModalOpen(false);
    
    // Add course with selected term
    console.log('✅ Adding course with selected term');
    await addCourse(selectedCourse, selectedTerm);
  };

  // Truncate course name for mobile breadcrumb
  const truncatedName = course.name.length > 30 
    ? `${course.name.substring(0, 30)}...` 
    : course.name;

  // Determine if we should show Programs tab (5+ programs)
  const allPrograms = [...course.programs, ...(course.orientations || [])];
  const showProgramsTab = allPrograms.length >= 5;

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
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/#courses">Courses</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] sm:max-w-none truncate">
                  <span className="hidden sm:inline">{course.name}</span>
                  <span className="inline sm:hidden">{truncatedName}</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Course Hero with CTA */}
          <CourseHero course={course}>
            <Button
              onClick={() => setIsTermModalOpen(true)}
              disabled={isInProfile}
              size="lg"
              className="w-full sm:w-auto hidden sm:flex shadow-md hover:shadow-lg transition-shadow"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isInProfile ? "Already in Profile" : "Add to Profile"}
            </Button>
          </CourseHero>

          {/* Mobile Sticky CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t border-border sm:hidden shadow-lg">
            <Button
              onClick={() => setIsTermModalOpen(true)}
              disabled={isInProfile}
              className="w-full shadow-md"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isInProfile ? "Already in Profile" : "Add to Profile"}
            </Button>
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">
                    Course Conflicts
                  </p>
                  <p className="text-sm text-destructive/90 dark:text-destructive/80 mt-1">
                    This course conflicts with {conflicts.length} course{conflicts.length > 1 ? 's' : ''} in your profile:
                    {' '}{conflicts.map(c => c.conflictingCourseId).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabbed Content */}
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${showProgramsTab ? 3 : 2}, 1fr)` }}>
              <TabsTrigger value="details" className="border-l-4 border-transparent data-[state=active]:border-picton-blue">
                Details
              </TabsTrigger>
              <TabsTrigger value="schedule" className="border-l-4 border-transparent data-[state=active]:border-picton-blue">
                Schedule
              </TabsTrigger>
              {showProgramsTab && (
                <TabsTrigger value="programs" className="border-l-4 border-transparent data-[state=active]:border-picton-blue">
                  Programs
                </TabsTrigger>
              )}
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6 mt-6">
              {/* Academic Information */}
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <CourseMetadataRow label="Examiner" value={course.examinator} />
                  <CourseMetadataRow label="Credits" value={`${course.credits} hp`} />
                  <CourseMetadataRow label="Study Director" value={course.studierektor} />
                  <CourseMetadataRow label="Study Pace" value={typeof course.pace === 'number' ? `${course.pace * 100}%` : course.pace} />
                  <CourseMetadataRow label="Subject Area (Huvudområde)" value={course.huvudomrade} />
                  <CourseMetadataRow label="Level" value={course.level} />
                  <div className="sm:col-span-2">
                    <a
                      href={`https://studieinfo.liu.se/kurs/${course.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on LiU Official Site
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Examination */}
              {Array.isArray(course.examination) && course.examination.length > 0 && (
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Examination</CardTitle>
                    <CardDescription>Assessment methods for this course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExaminationBadges examinations={course.examination} />
                  </CardContent>
                </Card>
              )}

              {/* Programs (if < 5, show here instead of separate tab) */}
              {!showProgramsTab && allPrograms.length > 0 && (
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Available in Programs</CardTitle>
                    <CardDescription>
                      This course is available for students in the following programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgramsList 
                      programs={course.programs} 
                      orientations={course.orientations}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Notes/Restrictions */}
              {course.notes && (
                <Card className="bg-background border-border border-l-4 border-l-destructive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap text-foreground">{course.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6 mt-6">
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Schedule Information
                  </CardTitle>
                  <CardDescription>When and where this course is offered</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <CourseMetadataRow 
                    label="Available Terms" 
                    value={Array.isArray(course.term) ? course.term.join(', ') : course.term} 
                  />
                  <CourseMetadataRow 
                    label="Period" 
                    value={Array.isArray(course.period) ? course.period.join(', ') : course.period} 
                  />
                  <CourseMetadataRow label="Block" value={formatBlocks(course.block)} />
                  <CourseMetadataRow label="Study Pace" value={course.pace} />
                  <CourseMetadataRow label="Campus" value={course.campus} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Programs Tab (only if 5+ programs) */}
            {showProgramsTab && (
              <TabsContent value="programs" className="space-y-6 mt-6">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Available in Programs</CardTitle>
                    <CardDescription>
                      This course is available for students in {allPrograms.length} programs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProgramsList 
                      programs={course.programs} 
                      orientations={course.orientations}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          <Separator className="my-8" />

          {/* Related Courses */}
          {(isLoadingRelated || relatedCourses.length > 0) && (
            <div className="mt-12 mb-20 sm:mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Related Courses</h2>
                {!isLoadingRelated && relatedCourses.length > 0 && (
                  <Link 
                    href={`/?huvudomraden=${encodeURIComponent((course.huvudomrade || '').split(',')[0].trim())}`}
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View All Similar Courses
                    </Button>
                  </Link>
                )}
              </div>
              
              {isLoadingRelated ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0">
                  {relatedCourses.map((relatedCourse) => (
                    <CourseCard key={relatedCourse.id} course={relatedCourse} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-20 sm:bottom-8 right-8 z-40 shadow-lg"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      {/* Term Selection Modal */}
      <TermSelectionModal
        course={course}
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        availableTerms={course.term.map((t: string) => Number.parseInt(t, 10) as 7 | 8 | 9)}
        onTermSelected={handleTermSelected}
      />
    </PageLayout>
  );
}

export default function CoursePageClient(props: CoursePageClientProps) {
  return <CoursePageContent {...props} />;
}
