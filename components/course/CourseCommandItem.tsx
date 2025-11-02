"use client";

import { AlertTriangle, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import { Badge } from "@/components/ui/badge";
import { CommandItem } from "@/components/ui/command";
import { findCourseConflicts } from "@/lib/course-conflict-utils";
import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { isCourseInProfile } from "@/lib/profile-utils";
import type { Course } from "@/types/course";

interface CourseCommandItemProps {
  course: Course;
  onSelect?: () => void;
}

export function CourseCommandItem({
  course,
  onSelect,
}: CourseCommandItemProps) {
  const { state, addCourse } = useProfile();
  const [isAdding, setIsAdding] = useState(false);

  const isPinned = state.current_profile
    ? isCourseInProfile(state.current_profile, course.id)
    : false;

  const wouldHaveConflicts = state.current_profile
    ? findCourseConflicts(course, state.current_profile).length > 0
    : false;

  const handleAddCourse = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isPinned || isAdding) {
      return;
    }

    setIsAdding(true);

    try {
      // For now, just add to the first available term
      // If multi-term, the main page's modal will handle term selection
      const termToAdd = Array.isArray(course.term)
        ? course.term[0]
        : course.term;
      const parsedTerm = Number.parseInt(termToAdd, 10);

      if (
        Number.isInteger(parsedTerm) &&
        MASTER_PROGRAM_TERMS.includes(parsedTerm as MasterProgramTerm)
      ) {
        await addCourse(course, parsedTerm as MasterProgramTerm);
        // Close the command dialog after adding
        onSelect?.();
      }
    } catch (error) {
      console.error("Failed to add course:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
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
      <div className="shrink-0">
        {isPinned ? (
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1">
            <Check className="h-3.5 w-3.5 mr-1" />
            Added
          </Badge>
        ) : wouldHaveConflicts ? (
          <Badge
            className="px-2.5 py-1 border border-destructive/40"
            variant="destructive"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            Conflict
          </Badge>
        ) : (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg ring-1 ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isAdding}
            onClick={handleAddCourse}
            type="button"
          >
            <Plus className="h-4 w-4 text-primary-foreground stroke-[2.5]" />
            Add
          </button>
        )}
      </div>
    </CommandItem>
  );
}
