// components/course/ConflictResolutionModal.tsx

import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractConflictingCourses } from "@/lib/course-conflict-utils";
import type { Course } from "@/types/course";

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCourse: Course;
  conflictingCourses: {
    conflictingCourse: Course;
    conflictingCourseId: string;
  }[];
  onChooseNew: (newCourse: Course) => void;
  onChooseExisting: (existingCourse: Course) => void;
  onCancel: () => void;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  newCourse,
  conflictingCourses,
  onChooseNew,
  onChooseExisting,
  onCancel,
}: ConflictResolutionModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<
    "new" | "existing" | null
  >(null);
  const [selectedExistingCourse, setSelectedExistingCourse] =
    useState<Course | null>(null);

  const handleConfirm = () => {
    if (selectedChoice === "new") {
      onChooseNew(newCourse);
    } else if (selectedChoice === "existing" && selectedExistingCourse) {
      onChooseExisting(selectedExistingCourse);
    }
  };

  const handleClose = () => {
    setSelectedChoice(null);
    setSelectedExistingCourse(null);
    onClose();
  };

  const handleCancel = () => {
    setSelectedChoice(null);
    setSelectedExistingCourse(null);
    onCancel();
  };

  // Get the reason for conflict from the notes
  const getConflictReason = (course: Course) => {
    const conflicts = extractConflictingCourses(course.notes);
    if (conflicts.length > 0) {
      return `Cannot be combined with: ${conflicts.join(", ")}`;
    }
    return "Has restrictions";
  };

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-card to-card/95 border-2 border-primary/30 shadow-2xl shadow-primary/10">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Course Selection Choice
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            These courses cannot be taken together. Please choose which one
            you&apos;d like to keep in your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* New Course */}
          <div
            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              selectedChoice === "new"
                ? "border-primary bg-linear-to-r from-primary/10 to-primary/5 shadow-lg shadow-primary/10"
                : "border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-md"
            }`}
            onClick={() => {
              setSelectedChoice("new");
              setSelectedExistingCourse(null);
            }}
          >
            {/* Selection indicator */}
            {selectedChoice === "new" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-primary">
                      New Course
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      (Add this one)
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-3 leading-tight">
                    {newCourse.name}
                  </h4>
                  <div className="mb-3">
                    <Badge
                      className="bg-primary/10 text-primary border-primary/30 font-medium"
                      variant="secondary"
                    >
                      {newCourse.id}
                    </Badge>
                  </div>
                  {newCourse.notes && (
                    <div className="bg-gradient-to-r from-chart-4/15 to-chart-4/10 border border-chart-4/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-chart-4 shrink-0 mt-0.5" />
                        <p className="text-sm text-chart-4 font-medium">
                          {getConflictReason(newCourse)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Existing Conflicting Courses */}
          <div
            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
              selectedChoice === "existing"
                ? "border-accent bg-linear-to-r from-accent/10 to-accent/5 shadow-lg shadow-accent/10"
                : "border-accent/40 bg-accent/10 hover:border-accent/60 hover:shadow-md"
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-accent">
                      Current Course{conflictingCourses.length > 1 ? "s" : ""}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      (Keep existing)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conflictingCourses.length === 1
                      ? "This course is"
                      : "These courses are"}{" "}
                    already in your profile
                  </p>
                </div>

                {/* Selection indicator for single course */}
                {conflictingCourses.length === 1 &&
                  selectedChoice === "existing" && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
              </div>

              {/* List of conflicting courses */}
              <div className="space-y-3">
                {conflictingCourses.map(({ conflictingCourse }) => (
                  <div
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      conflictingCourses.length === 1
                        ? selectedChoice === "existing"
                          ? "border-accent bg-accent/10"
                          : "border-accent/40 hover:border-accent/60"
                        : selectedChoice === "existing" &&
                            selectedExistingCourse?.id === conflictingCourse.id
                          ? "border-accent bg-accent/10 shadow-md"
                          : "border-accent/40 hover:border-accent/60 hover:bg-accent/10"
                    }`}
                    key={conflictingCourse.id}
                    onClick={() => {
                      setSelectedChoice("existing");
                      setSelectedExistingCourse(conflictingCourse);
                    }}
                  >
                    {/* Selection indicator for multiple courses */}
                    {conflictingCourses.length > 1 &&
                      selectedChoice === "existing" &&
                      selectedExistingCourse?.id === conflictingCourse.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-accent-foreground" />
                        </div>
                      )}

                    <h4 className="font-semibold text-foreground mb-3 pr-6">
                      {conflictingCourse.name}
                    </h4>
                    <div className="mb-3">
                      <Badge
                        className="bg-primary/10 text-primary border-primary/30 font-medium"
                        variant="secondary"
                      >
                        {conflictingCourse.id}
                      </Badge>
                    </div>
                    {conflictingCourse.notes && (
                      <div className="bg-gradient-to-r from-chart-4/15 to-chart-4/10 border border-chart-4/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-chart-4 shrink-0 mt-0.5" />
                          <p className="text-sm text-chart-4 font-medium">
                            {getConflictReason(conflictingCourse)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {selectedChoice
                ? selectedChoice === "new"
                  ? "New course will be added"
                  : "Current course will be kept"
                : "Please make a selection to continue"}
            </p>
            <div className="flex gap-3">
              <Button
                className="flex items-center gap-2 border-2 border-muted hover:bg-muted/50 transition-colors"
                onClick={handleCancel}
                variant="outline"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                disabled={
                  !selectedChoice ||
                  (selectedChoice === "existing" && !selectedExistingCourse)
                }
                onClick={handleConfirm}
              >
                <Check className="h-4 w-4" />
                Confirm Choice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
