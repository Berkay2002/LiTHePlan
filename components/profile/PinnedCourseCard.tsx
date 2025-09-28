// components/profile/PinnedCourseCard.tsx

import { AlertTriangle, Clock, ExternalLink, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatBlocks } from "@/lib/course-utils";
import type { Course } from "@/types/course";

interface PinnedCourseCardProps {
  course: Course;
  onRemove: (courseId: string) => void;
  readOnly?: boolean;
}

export function PinnedCourseCard({
  course,
  onRemove,
  readOnly = false,
}: PinnedCourseCardProps) {
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const formatPace = (pace: string) =>
    pace === "100%" ? "Full-time" : "Part-time";

  return (
    <Card className="w-full bg-card border-border/60 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight flex-1">
                {course.name}
              </h3>
              {course.notes && (
                <Tooltip open={isMobile ? showNotesTooltip : undefined}>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex-shrink-0 hover:bg-amber-200 transition-colors cursor-pointer"
                      onBlur={() => isMobile && setShowNotesTooltip(false)}
                      onClick={() =>
                        isMobile && setShowNotesTooltip(!showNotesTooltip)
                      }
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs font-bold">OBS</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    onPointerDownOutside={() =>
                      isMobile && setShowNotesTooltip(false)
                    }
                    side="top"
                  >
                    <p>{course.notes}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {course.id} • {course.credits}hp
            </p>
          </div>
          {!readOnly && (
            <Button
              aria-label="Remove course from profile"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(course.id)}
              size="sm"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Course Level Badge */}
        <div className="flex items-center gap-2">
          <Badge
            className="text-xs"
            variant={
              course.level === "avancerad nivå" ? "default" : "secondary"
            }
          >
            {course.level === "avancerad nivå" ? "Advanced" : "Basic"}
          </Badge>
          <Badge className="text-xs" variant="outline">
            Term {course.term}
          </Badge>
        </div>

        {/* Course Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatPace(course.pace)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{course.campus}</span>
          </div>
        </div>

        {/* Period and Block Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Period {course.period}</span>
          <span>•</span>
          <span>Block {formatBlocks(course.block)}</span>
        </div>

        {/* Programs and Orientations */}
        {(() => {
          const allProgramsAndOrientations = [
            ...course.programs,
            ...(course.orientations || []),
          ];
          return (
            allProgramsAndOrientations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allProgramsAndOrientations.slice(0, 2).map((item, index) => (
                  <Badge
                    className="text-xs px-2 py-0.5"
                    key={`${item}-${index}`}
                    variant="outline"
                  >
                    {item}
                  </Badge>
                ))}
                {allProgramsAndOrientations.length > 2 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        className="text-xs px-2 py-0.5 cursor-help"
                        variant="outline"
                      >
                        +{allProgramsAndOrientations.length - 2} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="space-y-1">
                        <p className="font-medium">Additional programs:</p>
                        <div className="text-slate-200 leading-relaxed">
                          {allProgramsAndOrientations.slice(2).join(", ")}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )
          );
        })()}

        {/* Action Button */}
        <Button
          className="w-full h-8 text-xs"
          onClick={() => {
            window.open(
              `https://studieinfo.liu.se/kurs/${course.id}`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          size="sm"
          variant="outline"
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          View Course
        </Button>
      </CardContent>
    </Card>
  );
}
