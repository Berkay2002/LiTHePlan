// components/ProfileStatsCard.tsx

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  PIE_CHART_RADIUS_FACTOR,
  PROFILE_STATS_PIE_CHART_SIZE,
  PROGRAM_FOCUS_TARGET_CREDITS,
} from "@/lib/profile-constants";
import type { StudentProfile } from "@/types/profile";

interface ProfileStatsCardProps {
  profile: StudentProfile;
  className?: string;
}

export function ProfileStatsCard({
  profile,
  className,
}: ProfileStatsCardProps) {
  const currentCredits = profile.metadata.total_credits;
  const targetCredits = MASTER_PROGRAM_TARGET_CREDITS;
  const percentage = Math.min((currentCredits / targetCredits) * 100, 100);

  // Calculate advanced credits
  const advancedCredits = profile.metadata.advanced_credits;
  const basicCredits = currentCredits - advancedCredits;
  const minAdvancedCredits = MASTER_PROGRAM_MIN_ADVANCED_CREDITS;
  const advancedPercentage = Math.min(
    (advancedCredits / minAdvancedCredits) * 100,
    100
  );

  // Calculate program distribution (advanced courses only)
  const programCredits: Record<string, number> = {};

  MASTER_PROGRAM_TERMS.forEach((term) => {
    profile.terms[term].forEach((course) => {
      // Only count advanced courses for Top Programs
      if (course.level === "avancerad nivå") {
        // Count both programs and orientations
        const allProgramsAndOrientations = [
          ...course.programs,
          ...(course.orientations || []),
        ];
        allProgramsAndOrientations.forEach((program) => {
          programCredits[program] =
            (programCredits[program] || 0) + course.credits;
        });
      }
    });
  });

  // Get top 3 programs
  const top3Programs = Object.entries(programCredits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([program, credits]) => ({
      program,
      credits,
      percentage: Math.min((credits / PROGRAM_FOCUS_TARGET_CREDITS) * 100, 100), // Assuming PROGRAM_FOCUS_TARGET_CREDITS hp target per program
    }));

  // Pie chart segments - using CSS custom properties for theme compatibility
  const remaining = targetCredits - currentCredits;
  const segments = [
    {
      label: "Advanced",
      value: advancedCredits,
      color: "var(--color-chart-1)",
    },
    { label: "Basic", value: basicCredits, color: "var(--color-chart-2)" },
    {
      label: "Remaining",
      value: Math.max(0, remaining),
      color: "var(--color-chart-3)",
    },
  ].filter((segment) => segment.value > 0);

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  // Calculate angles for pie chart
  let currentAngle = 0;
  const segmentsWithAngles = segments.map((segment) => {
    const angle = (segment.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...segment, startAngle, angle };
  });

  const size = PROFILE_STATS_PIE_CHART_SIZE;
  const center = size / 2;
  const radius = size * PIE_CHART_RADIUS_FACTOR;

  // Function to create SVG path for pie segment
  const createPath = (startAngle: number, angle: number) => {
    const start = startAngle * (Math.PI / 180);
    const end = (startAngle + angle) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(start);
    const y1 = center + radius * Math.sin(start);
    const x2 = center + radius * Math.cos(end);
    const y2 = center + radius * Math.sin(end);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <Card className={`${className} bg-background border-border shadow-lg`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Pie Chart */}
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Progress text above pie chart */}
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {currentCredits} / {targetCredits} hp
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.round(percentage)}% complete
              </div>
            </div>

            {/* Proper Pie Chart (no center hole) */}
            <div>
              <svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
                {segmentsWithAngles.map((segment, index) => (
                  <path
                    d={createPath(segment.startAngle, segment.angle)}
                    fill={segment.color}
                    key={`segment-${segment.label}-${index}`}
                    stroke="hsl(var(--card))"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>

            {/* Simple Legend */}
            <div className="flex flex-wrap gap-4 justify-center">
              {segmentsWithAngles.map((segment, index) => (
                <div
                  className="flex items-center gap-2"
                  key={`legend-${segment.label}-${index}`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm text-foreground">
                    {segment.label} ({segment.value}hp)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Statistics */}
          <div className="space-y-6">
            {/* Advanced Credits Section */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  Advanced Credits
                </h3>
                <Badge
                  variant={
                    advancedCredits >= minAdvancedCredits
                      ? "default"
                      : "secondary"
                  }
                >
                  {advancedCredits} / {minAdvancedCredits} hp
                </Badge>
              </div>

              <Progress className="h-2 mb-2" value={advancedPercentage} />

              <div className="flex justify-between text-xs">
                <span className="text-foreground">
                  Required: {minAdvancedCredits}hp
                </span>
                {advancedCredits >= minAdvancedCredits ? (
                  <span className="text-chart-2 font-medium">
                    ✓ Complete
                  </span>
                ) : (
                  <span className="text-chart-4 font-medium">
                    {minAdvancedCredits - advancedCredits}hp needed
                  </span>
                )}
              </div>
            </div>

            {/* Top Programs Section */}
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">
                  Top Programs
                </h3>
                <Badge className="text-xs font-medium" variant="outline">
                  {Object.keys(programCredits).length} total
                </Badge>
              </div>

              <div className="space-y-3">
                {top3Programs.length > 0 ? (
                  top3Programs.map(
                    ({ program, credits, percentage }, index) => (
                      <div className="space-y-2" key={program}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-xs font-medium text-muted-foreground shrink-0 w-4">
                              #{index + 1}
                            </span>
                            <span
                              className="text-sm font-medium truncate text-foreground"
                              title={program}
                            >
                              {program}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground shrink-0">
                            {credits} / {PROGRAM_FOCUS_TARGET_CREDITS} hp
                          </span>
                        </div>
                        <Progress className="h-1.5" value={percentage} />
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No programs selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
