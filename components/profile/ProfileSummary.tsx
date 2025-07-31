// components/profile/ProfileSummary.tsx

import { StudentProfile } from '@/types/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { getProfileSummary } from '@/lib/profile-utils';

interface ProfileSummaryProps {
  profile: StudentProfile;
  onToggleView: () => void;
  isProfileView: boolean;
}

export function ProfileSummary({ profile, onToggleView, isProfileView }: ProfileSummaryProps) {
  const summary = getProfileSummary(profile);

  const getCompletionColor = () => {
    const percentage = (summary.totalCredits / 90) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAdvancedRequirementColor = () => {
    return summary.meetsAdvancedRequirement ? 'text-green-600' : 'text-amber-600';
  };

  return (
    <Card className="w-full bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
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
                <div className="text-xs text-muted-foreground">
                  Courses
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getCompletionColor()}`}>
                  {summary.totalCredits}
                </div>
                <div className="text-xs text-muted-foreground">
                  Credits
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getAdvancedRequirementColor()}`}>
                  {summary.advancedCredits}
                </div>
                <div className="text-xs text-muted-foreground">
                  Advanced
                </div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getCompletionColor()}`}>
                  {Math.round((summary.totalCredits / 90) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress to 90hp</span>
                <span className="font-medium">{summary.totalCredits}/90hp</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    summary.totalCredits >= 90 
                      ? 'bg-green-500' 
                      : summary.totalCredits >= 67 
                      ? 'bg-blue-500' 
                      : summary.totalCredits >= 45 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((summary.totalCredits / 90) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Requirements Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {summary.meetsAdvancedRequirement ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className={getAdvancedRequirementColor()}>
                  Advanced Level Requirement
                </span>
                <Badge variant="outline" className="text-xs">
                  {summary.advancedCredits}/30hp
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {summary.isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Target className="h-4 w-4 text-blue-600" />
                )}
                <span className={summary.isComplete ? 'text-green-600' : 'text-blue-600'}>
                  Total Credits Target
                </span>
                <Badge variant="outline" className="text-xs">
                  {summary.totalCredits}/90hp
                </Badge>
              </div>
            </div>

            {/* Validation Messages */}
            {(summary.errors.length > 0 || summary.warnings.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                {summary.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-destructive">{error}</span>
                  </div>
                ))}
                {summary.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-600">{warning}</span>
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