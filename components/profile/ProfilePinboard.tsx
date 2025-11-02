// components/profile/ProfilePinboard.tsx

import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { getProfileSummary } from "@/lib/profile-utils";
import type { StudentProfile } from "@/types/profile";
import { PinnedCourseCard } from "./PinnedCourseCard";

interface ProfilePinboardProps {
  profile: StudentProfile;
  onRemoveCourse: (courseId: string) => void;
  onClearTerm: (term: MasterProgramTerm) => void;
  onClearProfile: () => void;
  readOnly?: boolean;
}

export function ProfilePinboard({
  profile,
  onRemoveCourse,
  onClearTerm,
  onClearProfile,
  readOnly = false,
}: ProfilePinboardProps) {
  const summary = getProfileSummary(profile);

  const renderTermSection = (term: MasterProgramTerm) => {
    const courses = profile.terms[term];
    const termCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    const advancedCredits = courses.reduce(
      (sum, course) =>
        sum + (course.level === "avancerad nivå" ? course.credits : 0),
      0
    );

    return (
      <Card className="w-full bg-card border-border shadow-lg" key={term}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold text-card-foreground">
                Term {term}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="text-xs" variant="outline">
                  {courses.length} course{courses.length !== 1 ? "s" : ""}
                </Badge>
                <Badge className="text-xs" variant="secondary">
                  {termCredits}hp
                </Badge>
                {advancedCredits > 0 && (
                  <Badge className="text-xs" variant="default">
                    {advancedCredits}hp advanced
                  </Badge>
                )}
              </div>
            </div>
            {courses.length > 0 && !readOnly && (
              <Button
                aria-label={`Clear all courses from Term ${term}`}
                className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onClearTerm(term)}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                No courses added yet
              </p>
              <p className="text-xs text-muted-foreground/70">
                Add courses from the catalog to build your study plan
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <PinnedCourseCard
                  course={course}
                  key={course.id}
                  onRemove={onRemoveCourse}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            {profile.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Created {profile.created_at.toLocaleDateString()} • Last updated{" "}
            {profile.updated_at.toLocaleDateString()}
          </p>
        </div>
        {summary.totalCourses > 0 && !readOnly && (
          <Button
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onClearProfile}
            size="sm"
            variant="outline"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Profile Summary */}
      {summary.totalCourses > 0 && (
        <Card className="bg-card/50 border-border shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-card-foreground">
                  {summary.totalCourses}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Courses
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">
                  {summary.totalCredits}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Credits
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">
                  {summary.advancedCredits}
                </div>
                <div className="text-xs text-muted-foreground">
                  Advanced Credits
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">
                  {Math.round(
                    (summary.totalCredits / MASTER_PROGRAM_TARGET_CREDITS) * 100
                  )}
                  %
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>

            {/* Validation Status */}
            {(summary.errors.length > 0 || summary.warnings.length > 0) && (
              <div className="mt-4 space-y-2">
                {summary.errors.map((error, index) => (
                  <div
                    className="text-sm text-destructive bg-destructive/10 p-2 rounded"
                    key={`error-${index}-${error.slice(0, 20)}`}
                  >
                    ⚠️ {error}
                  </div>
                ))}
                {summary.warnings.map((warning, index) => (
                  <div
                    className="text-sm text-chart-4 bg-chart-4/10 p-2 rounded"
                    key={`warning-${index}-${warning.slice(0, 20)}`}
                  >
                    ℹ️ {warning}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Term Sections */}
      <div className="space-y-6">
        {MASTER_PROGRAM_TERMS.map((term) => renderTermSection(term))}
      </div>

      {/* Empty State */}
      {summary.totalCourses === 0 && (
        <Card className="bg-card/50 border-border shadow-lg">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Plus className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Start Building Your Profile
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Browse the course catalog and add courses to your profile to
                create your personalized study plan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
