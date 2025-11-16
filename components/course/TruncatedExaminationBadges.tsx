"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedExaminationBadgesProps {
  examinations: string[];
  maxVisible?: number;
  shortMode?: boolean;
  className?: string;
}

const EXAMINATION_LABELS: Record<string, string> = {
  TEN: "Written Exam",
  LAB: "Laboratory Work",
  PROJ: "Project",
  SEM: "Seminar",
  UPG: "Assignment",
  HEM: "Home Exam",
  KTR: "Control",
  MUN: "Oral Exam",
  PRA: "Practical",
  DAT: "Computer Exercise",
};

export function TruncatedExaminationBadges({
  examinations,
  maxVisible = 2,
  shortMode = false,
  className = "",
}: TruncatedExaminationBadgesProps) {
  if (!examinations || examinations.length === 0) return null;

  const visibleExams = examinations.slice(0, maxVisible);
  const hiddenExams = examinations.slice(maxVisible);
  const hasOverflow = hiddenExams.length > 0;

  const getDisplayLabel = (exam: string) => {
    if (shortMode) {
      return exam;
    }
    return EXAMINATION_LABELS[exam] || exam;
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleExams.map((exam, index) => (
        <Badge
          className="text-[11px] px-2 py-0.5 font-semibold bg-muted/60 text-muted-foreground border border-border/40"
          key={`${exam}-${index}`}
          variant="outline"
        >
          {getDisplayLabel(exam)}
        </Badge>
      ))}
      {hasOverflow && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className="text-[11px] px-2 py-0.5 font-semibold bg-muted/60 text-muted-foreground border border-border/40 cursor-help hover:bg-muted/80 transition-colors"
              variant="outline"
            >
              +{hiddenExams.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="top">
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-xs mb-1">
                Additional Examinations:
              </p>
              <div className="flex flex-wrap gap-1">
                {hiddenExams.map((exam, index) => (
                  <span
                    className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary-foreground font-medium"
                    key={`hidden-${exam}-${index}`}
                  >
                    {getDisplayLabel(exam)}
                  </span>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
