// components/profile/ProfileSidebar.tsx

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type CSSProperties, useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
  PIE_CHART_RADIUS_FACTOR,
  PROFILE_SIDEBAR_COLLAPSED_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH,
  PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
  PROFILE_SIDEBAR_PIE_CHART_SIZE,
} from "@/lib/profile-constants";
import { cn } from "@/lib/utils";
import type { StudentProfile } from "@/types/profile";

interface ProfileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: StudentProfile | null;
}

const EXPAND_PROFILE_RAIL_LABEL = "Expand profile rail";
const COLLAPSE_PROFILE_RAIL_LABEL = "Collapse profile rail";
const CLOSE_PROFILE_RAIL_LABEL = "Close profile rail";
const DISMISS_PROFILE_RAIL_LABEL = "Dismiss profile rail overlay";

export function ProfileSidebar({
  profile,
  isOpen,
  onToggle,
}: ProfileSidebarProps) {
  const sidebarId = useId();
  const titleId = `${sidebarId}-title`;
  const [currentTermIndex, setCurrentTermIndex] = useState(0);
  const terms = MASTER_PROGRAM_TERMS;

  // Calculate values only if profile exists
  const currentCredits = profile?.metadata.total_credits ?? 0;
  const targetCredits = MASTER_PROGRAM_TARGET_CREDITS;
  const percentage = Math.min((currentCredits / targetCredits) * 100, 100);

  // Calculate advanced credits
  const advancedCredits = profile?.metadata.advanced_credits ?? 0;
  const basicCredits = currentCredits - advancedCredits;

  // Pie chart segments
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
    currentTerm !== undefined ? (profile?.terms[currentTerm] ?? []) : [];

  const nextTerm = () => {
    setCurrentTermIndex((prev) => (prev + 1) % terms.length);
  };

  const prevTerm = () => {
    setCurrentTermIndex((prev) => (prev - 1 + terms.length) % terms.length);
  };

  const getTermLabel = (term: MasterProgramTerm) => `Term ${term}`;
  const previousTerm =
    terms[(currentTermIndex - 1 + terms.length) % terms.length] ?? currentTerm;
  const followingTerm =
    terms[(currentTermIndex + 1) % terms.length] ?? currentTerm;
  const sidebarTitle = profile ? "Profile rail" : "Build your profile";
  const sidebarDescription = profile
    ? "Progress and current term selections"
    : "Track credits and pinned courses here";

  return (
    <>
      {isOpen && (
        <button
          aria-label={DISMISS_PROFILE_RAIL_LABEL}
          className="fixed inset-0 z-40 w-full border-0 bg-foreground/45 lg:hidden"
          onClick={onToggle}
          title={CLOSE_PROFILE_RAIL_LABEL}
          type="button"
        />
      )}

      <div
        aria-labelledby={isOpen ? titleId : undefined}
        className={cn(
          "fixed right-0 top-0 z-50 h-screen border-l border-sidebar-border/70 bg-sidebar/95 text-sidebar-foreground shadow-[-12px_0_30px_-24px_hsl(var(--foreground)/0.45)] backdrop-blur supports-[backdrop-filter]:bg-sidebar/90 lg:z-30 lg:h-svh",
          "transition-[transform,width] duration-300 ease-in-out",
          isOpen
            ? "w-[min(100vw,22rem)] translate-x-0 sm:w-80 lg:w-[var(--profile-sidebar-width)] xl:w-[var(--profile-sidebar-width-xl)]"
            : "w-0 translate-x-full overflow-hidden lg:w-[var(--profile-sidebar-width-collapsed)] lg:translate-x-0"
        )}
        id={sidebarId}
        style={
          {
            "--profile-sidebar-width": PROFILE_SIDEBAR_DESKTOP_WIDTH,
            "--profile-sidebar-width-collapsed":
              PROFILE_SIDEBAR_COLLAPSED_WIDTH,
            "--profile-sidebar-width-xl": PROFILE_SIDEBAR_DESKTOP_WIDTH_XL,
          } as CSSProperties
        }
      >
        {!isOpen && (
          <div className="hidden h-full flex-col items-center bg-sidebar/95 px-2 py-4 lg:flex">
            <div className="flex w-full justify-center">
              <Button
                aria-controls={sidebarId}
                aria-expanded={false}
                aria-label={EXPAND_PROFILE_RAIL_LABEL}
                className="size-10 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={onToggle}
                size="sm"
                title={EXPAND_PROFILE_RAIL_LABEL}
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 flex flex-1 items-center justify-center">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/50 [writing-mode:vertical-rl]">
                Profile
              </span>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-sidebar-border/70 bg-sidebar/95 px-4 py-3 xl:px-5">
              <div className="min-w-0">
                <h2
                  className="text-sm font-semibold text-sidebar-foreground"
                  id={titleId}
                >
                  {sidebarTitle}
                </h2>
                <p className="mt-1 text-xs text-sidebar-foreground/65">
                  {sidebarDescription}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  aria-controls={sidebarId}
                  aria-expanded={isOpen}
                  aria-label={COLLAPSE_PROFILE_RAIL_LABEL}
                  className="hidden size-9 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent lg:flex"
                  onClick={onToggle}
                  size="sm"
                  title={COLLAPSE_PROFILE_RAIL_LABEL}
                  type="button"
                  variant="ghost"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  aria-controls={sidebarId}
                  aria-expanded={isOpen}
                  aria-label={CLOSE_PROFILE_RAIL_LABEL}
                  className="size-9 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
                  onClick={onToggle}
                  size="sm"
                  title={CLOSE_PROFILE_RAIL_LABEL}
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="filter-panel-scroll flex-1 overflow-y-auto overflow-x-hidden p-4 xl:p-5">
              {profile ? (
                <div className="space-y-4">
                  <section className="space-y-4 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
                          Progress
                        </p>
                        <p className="mt-1 text-xs text-sidebar-foreground/65">
                          Credit split across your plan
                        </p>
                      </div>
                      <Badge className="shrink-0" variant="secondary">
                        {Math.round(percentage)}%
                      </Badge>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[auto,1fr] xl:items-center">
                      <div className="mx-auto flex flex-col items-center justify-center text-center">
                        <div className="text-xl font-semibold text-sidebar-foreground">
                          {currentCredits}
                          <span className="text-sm font-normal text-sidebar-foreground/65">
                            {" "}
                            / {targetCredits} hp
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-sidebar-foreground/70">
                          completed credits
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-center xl:justify-start">
                          <svg
                            aria-label="Credit distribution pie chart"
                            height={size}
                            role="img"
                            viewBox={`0 0 ${size} ${size}`}
                            width={size}
                          >
                            {segmentsWithAngles.map((segment) => (
                              <path
                                d={createPath(
                                  segment.startAngle,
                                  segment.angle
                                )}
                                fill={segment.color}
                                key={`segment-${segment.label}`}
                                stroke="hsl(var(--background))"
                                strokeWidth="2"
                              />
                            ))}
                          </svg>
                        </div>

                        <div className="space-y-2">
                          {segmentsWithAngles.map((segment) => (
                            <div
                              className="flex items-center gap-2 text-xs"
                              key={`legend-${segment.label}`}
                            >
                              <div
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: segment.color }}
                              />
                              <span className="flex-1 text-sidebar-foreground/75">
                                {segment.label}
                              </span>
                              <span className="font-medium text-sidebar-foreground">
                                {segment.value} hp
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/15 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">
                          Course preview
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-sidebar-foreground">
                          {getTermLabel(currentTerm)}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl border border-sidebar-border/70 bg-background/70 p-1">
                        <Button
                          aria-label={`Show previous term (${getTermLabel(previousTerm)})`}
                          className="h-7 w-7 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
                          onClick={prevTerm}
                          size="sm"
                          title={`Show previous term (${getTermLabel(previousTerm)})`}
                          type="button"
                          variant="ghost"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[4.75rem] text-center text-xs text-sidebar-foreground/75">
                          {currentTermCourses.reduce(
                            (sum, course) => sum + course.credits,
                            0
                          )}{" "}
                          hp
                        </span>
                        <Button
                          aria-label={`Show next term (${getTermLabel(followingTerm)})`}
                          className="h-7 w-7 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
                          onClick={nextTerm}
                          size="sm"
                          title={`Show next term (${getTermLabel(followingTerm)})`}
                          type="button"
                          variant="ghost"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <Card className="border-sidebar-border/70 bg-background/80 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm font-medium text-foreground">
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
                      <CardContent className="pt-0">
                        {currentTermCourses.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-sidebar-border/70 bg-sidebar-accent/10 py-5 text-center text-muted-foreground">
                            <p className="text-xs">No courses selected</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentTermCourses.map((course) => (
                              <div
                                className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/10 px-3 py-2 transition-colors hover:bg-sidebar-accent/20"
                                key={course.id}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">
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
                  </section>
                </div>
              ) : (
                <div className="flex h-full items-center">
                  <div className="w-full space-y-4 rounded-2xl border border-dashed border-sidebar-border/70 bg-sidebar-accent/15 p-5 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sidebar-accent/35">
                      <ChevronRight className="h-8 w-8 text-sidebar-foreground/60" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-sidebar-foreground">
                        Start building your profile
                      </h3>
                      <p className="text-sm text-sidebar-foreground/75">
                        Add courses to see your progress and term plan here. Use
                        the course catalog and the &ldquo;+&rdquo; action to
                        build the rail.
                      </p>
                    </div>
                    <div className="space-y-2 text-left text-xs text-sidebar-foreground/65">
                      <div className="rounded-xl border border-sidebar-border/60 bg-background/65 px-3 py-2">
                        Plan up to {MASTER_PROGRAM_TARGET_CREDITS} hp in total.
                      </div>
                      <div className="rounded-xl border border-sidebar-border/60 bg-background/65 px-3 py-2">
                        Mix advanced and basic level courses across terms.
                      </div>
                    </div>
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
