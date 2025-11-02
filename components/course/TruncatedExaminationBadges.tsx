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
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visibleExams.map((exam, index) => (
        <Badge
          className="text-xs px-3 py-1 bg-secondary/50 text-secondary-foreground border border-secondary/30 hover:bg-secondary/60 transition-all duration-200"
          key={`${exam}-${index}`}
          variant="secondary"
        >
          {getDisplayLabel(exam)}
        </Badge>
      ))}
      {hasOverflow && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              className="text-xs px-3 py-1 bg-secondary/50 text-secondary-foreground border border-secondary/30 hover:bg-secondary/60 transition-all duration-200 cursor-help"
              variant="secondary"
            >
              +{hiddenExams.length} more
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
                    className="text-xs px-2 py-0.5 rounded bg-secondary/20 border border-secondary/30"
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
