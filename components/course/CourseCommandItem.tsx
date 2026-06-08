"use client";

import { AlertTriangle, Check, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CommandItem } from "@/components/ui/command";
import { useProfilePlanningCommand } from "@/hooks/useProfilePlanningCommand";
import type { Course } from "@/types/course";
import { ConflictResolutionModal } from "./ConflictResolutionModal";
import { TermSelectionModal } from "./TermSelectionModal";

interface CourseCommandItemProps {
  course: Course;
  onSelect?: () => void;
}

export function CourseCommandItem({
  course,
  onSelect,
}: CourseCommandItemProps) {
  const { actionState, conflictModal, requestAdd, termModal } =
    useProfilePlanningCommand(course, { onAdded: onSelect });
  const [isAdding, setIsAdding] = useState(false);

  const { isPinned, wouldHaveConflicts } = actionState;

  const handleAddCourse = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isPinned || isAdding) {
      return;
    }

    setIsAdding(true);

    try {
      await requestAdd();
    } finally {
      setIsAdding(false);
    }
  };

  const actionControl = (() => {
    if (isPinned) {
      return (
        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1">
          <Check className="h-3.5 w-3.5 mr-1" />
          Added
        </Badge>
      );
    }

    if (wouldHaveConflicts) {
      return (
        <button
          className="inline-flex items-center rounded-md border border-destructive/40 bg-destructive px-2.5 py-1 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isAdding}
          onClick={handleAddCourse}
          type="button"
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          Conflict
        </button>
      );
    }

    return (
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg ring-1 ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isAdding}
        onClick={handleAddCourse}
        type="button"
      >
        <Plus className="h-4 w-4 text-primary-foreground stroke-[2.5]" />
        Add
      </button>
    );
  })();

  return (
    <>
      <CommandItem
        className="flex items-center justify-between gap-3 py-2.5 px-3 cursor-pointer border-b border-border/30 last:border-0 hover:bg-muted/70 transition-colors duration-200"
        onSelect={onSelect}
        value={`${course.id} ${course.name}`}
      >
        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-mono font-bold text-primary shrink-0">
              {course.id}
            </span>
            <h4 className="text-[15px] font-medium text-foreground truncate">
              {course.name}
            </h4>
          </div>
        </div>

        {/* Add Button */}
        <div className="shrink-0">{actionControl}</div>
      </CommandItem>

      <TermSelectionModal {...termModal} />
      <ConflictResolutionModal {...conflictModal} />
    </>
  );
}
