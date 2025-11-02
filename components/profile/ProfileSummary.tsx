// components/profile/ProfileSummary.tsx

import { AlertTriangle, BookOpen, CheckCircle, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
} from "@/lib/profile-constants";
import { getProfileSummary } from "@/lib/profile-utils";
import type { StudentProfile } from "@/types/profile";

interface ProfileSummaryProps {
  profile: StudentProfile;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const summary = getProfileSummary(profile);
  const completionRatio = summary.totalCredits / MASTER_PROGRAM_TARGET_CREDITS;

  const getCompletionColor = () => {
    if (completionRatio >= 1) return "text-chart-2";
    if (completionRatio >= 0.75) return "text-primary";
    if (completionRatio >= 0.5) return "text-chart-4";
    return "text-destructive";
  };

  const getCompletionBarColor = () => {
    if (completionRatio >= 1) return "bg-chart-2";
    if (completionRatio >= 0.75) return "bg-primary";
    if (completionRatio >= 0.5) return "bg-chart-4";
    return "bg-destructive";
  };

  const getAdvancedRequirementColor = () =>
    summary.meetsAdvancedRequirement ? "text-chart-2" : "text-chart-4";

  return (
    <Card className="w-full bg-card border-border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
            <BookOpen className="h-5 w-5" />
            Profile Summary
          </CardTitle>
          {/* Profile button now in navbar */}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {summary.totalCourses === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No courses added to your profile yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Start building your study plan by adding courses from the catalog
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">
                  {summary.totalCourses}
                </div>
                <div className="text-xs text-muted-foreground">Courses</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getCompletionColor()}`}>
                  {summary.totalCredits}
                </div>
                <div className="text-xs text-muted-foreground">Credits</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-xl font-bold ${getAdvancedRequirementColor()}`}
                >
                  {summary.advancedCredits}
                </div>
                <div className="text-xs text-muted-foreground">Advanced</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getCompletionColor()}`}>
                  {Math.round(completionRatio * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Progress to {MASTER_PROGRAM_TARGET_CREDITS}hp
                </span>
                <span className="font-medium">
                  {summary.totalCredits}/{MASTER_PROGRAM_TARGET_CREDITS}hp
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getCompletionBarColor()}`}
                  style={{
                    width: `${Math.min(completionRatio * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Requirements Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {summary.meetsAdvancedRequirement ? (
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-chart-4" />
                )}
                <span className={getAdvancedRequirementColor()}>
                  Advanced Level Requirement
                </span>
                <Badge className="text-xs" variant="outline">
                  {summary.advancedCredits}/
                  {MASTER_PROGRAM_MIN_ADVANCED_CREDITS}hp
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm">
                {summary.isComplete ? (
                  <CheckCircle className="h-4 w-4 text-chart-2" />
                ) : (
                  <Target className="h-4 w-4 text-primary" />
                )}
                <span
                  className={
                    summary.isComplete ? "text-chart-2" : "text-primary"
                  }
                >
                  Total Credits Target
                </span>
                <Badge className="text-xs" variant="outline">
                  {summary.totalCredits}/{MASTER_PROGRAM_TARGET_CREDITS}hp
                </Badge>
              </div>
            </div>

            {/* Validation Messages */}
            {(summary.errors.length > 0 || summary.warnings.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                {summary.errors.map((error, index) => (
                  <div
                    className="flex items-start gap-2 text-xs"
                    key={`error-${index}-${error.slice(0, 20)}`}
                  >
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                    <span className="text-destructive">{error}</span>
                  </div>
                ))}
                {summary.warnings.map((warning, index) => (
                  <div
                    className="flex items-start gap-2 text-xs"
                    key={`warning-${index}-${warning.slice(0, 20)}`}
                  >
                    <AlertTriangle className="h-3 w-3 text-chart-4 mt-0.5 shrink-0" />
                    <span className="text-chart-4">{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
