// components/profile/ProfileSidebar.tsx

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  PIE_CHART_RADIUS_FACTOR,
  PROFILE_SIDEBAR_PIE_CHART_SIZE,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { cn } from "@/lib/utils";
import type { StudentProfile } from "@/types/profile";

interface ProfileSidebarProps {
  profile: StudentProfile | null;
  isOpen: boolean;
  onToggle: () => void;
}

export function ProfileSidebar({
  profile,
  isOpen,
  onToggle,
}: ProfileSidebarProps) {
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const terms = MASTER_PROGRAM_TERMS;

  // Calculate values only if profile exists
  const currentCredits = profile?.metadata.totalCredits ?? 0;
  const targetCredits = MASTER_PROGRAM_TARGET_CREDITS;
  const percentage = Math.min((currentCredits / targetCredits) * 100, 100);

  // Calculate advanced credits
  const advancedCredits = profile?.metadata.advancedCredits ?? 0;
  const basicCredits = currentCredits - advancedCredits;

  // Pie chart segments
  const remaining = targetCredits - currentCredits;
  const segments = [
    { label: "Advanced", value: advancedCredits, color: "#3b82f6" },
    { label: "Basic", value: basicCredits, color: "#10b981" },
    { label: "Remaining", value: Math.max(0, remaining), color: "#e5e7eb" },
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

  const size = PROFILE_SIDEBAR_PIE_CHART_SIZE;
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

  const currentTerm = terms[currentTermIndex] ?? terms[0];
  const currentTermCourses =
    currentTerm !== undefined ? profile?.terms[currentTerm] ?? [] : [];

  const nextTerm = () => {
    setCurrentTermIndex((prev) => (prev + 1) % terms.length);
  };

  const prevTerm = () => {
    setCurrentTermIndex((prev) => (prev - 1 + terms.length) % terms.length);
  };

  const getTermLabel = (term: MasterProgramTerm) => `Term ${term}`;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Profile Sidebar - Fixed position */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen lg:top-16 lg:h-[calc(100vh-4rem)] bg-air-superiority-blue-400 border-l-2 border-air-superiority-blue-300/40 shadow-xl shadow-air-superiority-blue-200/20 z-50 transition-all duration-300 ease-in-out",
          "flex flex-col ring-1 ring-air-superiority-blue-300/30",
          isOpen ? "w-72 lg:w-80 xl:w-96" : "w-0 lg:w-12",
          "lg:fixed lg:z-30 lg:shadow-2xl lg:shadow-air-superiority-blue-300/30"
        )}
      >
        {/* Collapsed State - Modern Toggle Button (Desktop Only) */}
        {!isOpen && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full w-12 relative">
            {/* Modern Floating Expand Button */}
            <div className="relative group">
              <Button
                className="h-10 w-10 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={onToggle}
                size="sm"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5 text-white group-hover:text-primary transition-colors duration-200" />
              </Button>

              {/* Tooltip on hover */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-slate-50 border border-slate-700/50 shadow-xl text-sm font-medium px-4 py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]">
                {profile ? "Open Profile" : "Start Building Profile"}
              </div>
            </div>
          </div>
        )}

        {/* Expanded State - Full Sidebar Content */}
        {isOpen && (
          <div className="flex flex-col h-full relative">
            {/* Modern Floating Collapse Button - Left Edge (Desktop Only) */}
            <div
              className="hidden lg:block absolute -left-6 top-1/2 z-50"
              style={{ transform: "translateY(-50%)" }}
            >
              <div className="relative group">
                <Button
                  className="h-10 w-10 p-0 bg-air-superiority-blue-400/90 hover:bg-air-superiority-blue-500 backdrop-blur-sm border border-air-superiority-blue-300 hover:border-air-superiority-blue-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={onToggle}
                  size="sm"
                  variant="ghost"
                >
                  <ChevronRight className="h-5 w-5 text-white group-hover:text-picton-blue transition-colors duration-200" />
                </Button>

                {/* Tooltip on hover */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-slate-50 border border-slate-700/50 shadow-xl text-sm font-medium px-4 py-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]">
                  {profile ? "Close Profile" : "Close Sidebar"}
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="flex-shrink-0 p-4 border-b border-air-superiority-blue-300/40 bg-air-superiority-blue-300/30 lg:hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">
                  {profile ? "Profile Overview" : "Your Profile"}
                </h2>
                <Button
                  className="h-10 w-10 p-0 text-white hover:bg-white/20 hover:scale-110 transition-all duration-200 rounded-full border border-white/30 hover:border-white/50"
                  onClick={onToggle}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Profile Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-4 xl:p-6 space-y-4 lg:space-y-4 xl:space-y-5 filter-panel-scroll">
              {profile ? (
                <>
                  {/* Profile Progress Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">
                      Progress
                    </h3>

                    {/* Progress text */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {currentCredits} / {targetCredits} hp
                      </div>
                      <div className="text-xs text-white/80">
                        {Math.round(percentage)}% complete
                      </div>
                    </div>

                    {/* Compact Pie Chart */}
                    <div className="flex justify-center">
                      <svg
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        width={size}
                      >
                        {segmentsWithAngles.map((segment, index) => (
                          <path
                            d={createPath(segment.startAngle, segment.angle)}
                            fill={segment.color}
                            key={`segment-${segment.label}-${index}`}
                            stroke="white"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>

                    {/* Compact Legend */}
                    <div className="space-y-1">
                      {segmentsWithAngles.map((segment, index) => (
                        <div
                          className="flex items-center justify-between"
                          key={`legend-${segment.label}-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: segment.color }}
                            />
                            <span className="text-xs text-white/80">
                              {segment.label}
                            </span>
                          </div>
                          <span className="text-xs text-white font-medium">
                            {segment.value}hp
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Term Cards Slider Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm lg:text-sm xl:text-sm font-semibold text-white uppercase tracking-wide">
                        Terms
                      </h3>
                      <div className="flex items-center gap-1">
                        <Button
                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                          onClick={prevTerm}
                          size="sm"
                          variant="ghost"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-white/80 min-w-[60px] text-center">
                          {getTermLabel(currentTerm)}
                        </span>
                        <Button
                          className="h-6 w-6 p-0 text-white hover:bg-white/20"
                          onClick={nextTerm}
                          size="sm"
                          variant="ghost"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Current Term Card */}
                    <Card className="bg-card/80 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          {getTermLabel(currentTerm)}
                          <Badge className="text-xs" variant="secondary">
                            {currentTermCourses.reduce(
                              (sum, course) => sum + course.credits,
                              0
                            )}{" "}
                            hp
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentTermCourses.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-xs">No courses selected</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentTermCourses.map((course) => (
                              <div
                                className="p-2 rounded border bg-background/50 hover:bg-accent/50 transition-colors"
                                key={course.id}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {course.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {course.id} • {course.credits} hp
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                /* Empty State - No Profile */
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                      <ChevronRight className="h-8 w-8 text-white/60" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        Start Building Your Profile
                      </h3>
                      <p className="text-sm text-white/80 max-w-xs">
                        Add courses to start seeing your progress and term
                        planning here. Browse the course catalog and click the
                        &ldquo;+&rdquo; button to add courses to your profile.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-white/60">
                    <p>
                      💡 Tip: You can add up to {MASTER_PROGRAM_TARGET_CREDITS} credits
                    </p>
                    <p>📚 Mix advanced and basic level courses</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
