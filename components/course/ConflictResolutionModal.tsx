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
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

interface ConflictResolutionModalProps {
  conflictingCourses: {
    conflictingCourse: Course;
    conflictingCourseId: string;
  }[];
  isOpen: boolean;
  newCourse: Course;
  onCancel: () => void;
  onChooseExisting: (existingCourse: Course) => void;
  onChooseNew: (newCourse: Course) => void;
  onClose: () => void;
}

type SelectionChoice = "existing" | "new";
type ChoiceTone = "accent" | "primary";

interface SelectableCourseCardProps {
  caption: string;
  course: Course;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  tone: ChoiceTone;
}

const CHOICE_STYLES = {
  accent: {
    badge: "border-accent/24 bg-accent/7 text-accent",
    cardIdle:
      "border-accent/16 bg-card hover:border-accent/28 hover:bg-accent/4",
    cardSelected: "border-accent/32 bg-accent/6 shadow-sm shadow-black/4",
    description: "text-accent",
    note: "border-accent/18 bg-accent/5 text-accent",
    selection: "border-accent bg-accent text-accent-foreground",
  },
  primary: {
    badge: "border-primary/24 bg-primary/7 text-primary",
    cardIdle:
      "border-primary/16 bg-card hover:border-primary/28 hover:bg-primary/4",
    cardSelected: "border-primary/32 bg-primary/6 shadow-sm shadow-black/4",
    description: "text-primary",
    note: "border-primary/18 bg-primary/5 text-primary",
    selection: "border-primary bg-primary text-primary-foreground",
  },
} as const;

const getConflictReasonText = (course: Course): string => {
  const conflicts = extractConflictingCourses(course.notes);

  if (conflicts.length > 0) {
    return `Cannot be combined with: ${conflicts.join(", ")}`;
  }

  return "This course has scheduling or degree restrictions.";
};

const getCourseLevelLabel = (level: Course["level"]): string => {
  if (level === "avancerad nivå") {
    return "Advanced";
  }

  return "Basic";
};

const getCourseLevelBadgeClassName = (level: Course["level"]): string => {
  if (level === "avancerad nivå") {
    return "border-primary/25 bg-primary/10 text-primary";
  }

  return "border-chart-2/25 bg-chart-2/10 text-chart-2";
};

const getSelectionStatusCopy = (
  selectedChoice: SelectionChoice | null,
  selectedExistingCourse: Course | null,
  newCourse: Course
): string => {
  if (selectedChoice === "new") {
    return `Confirm to replace the conflicting course selection with ${newCourse.id}.`;
  }

  if (selectedChoice === "existing" && selectedExistingCourse) {
    return `Confirm to keep ${selectedExistingCourse.id} and skip adding ${newCourse.id}.`;
  }

  return "Choose which course should remain in your profile.";
};

function SelectableCourseCard({
  caption,
  course,
  description,
  isSelected,
  onSelect,
  tone,
}: SelectableCourseCardProps) {
  const styles = CHOICE_STYLES[tone];
  const conflictReason =
    course.notes && course.notes.trim().length > 0
      ? getConflictReasonText(course)
      : null;

  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "group relative flex w-full flex-col rounded-[1.35rem] border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:rounded-[1.75rem] sm:p-6",
        isSelected ? styles.cardSelected : styles.cardIdle
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
        <div
          className={cn(
            "flex size-7 items-center justify-center rounded-full border bg-background transition-all duration-200 sm:size-8",
            isSelected
              ? styles.selection
              : "border-border/70 text-muted-foreground"
          )}
        >
          <Check className="size-4" />
        </div>
      </div>

      <div className="space-y-4 pr-12">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
                styles.badge
              )}
            >
              {caption}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
              {course.name}
            </h3>
            <p className={cn("text-sm font-medium", styles.description)}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Badge className="border-primary/25 bg-primary/10 text-primary">
            {course.id}
          </Badge>
          <Badge className="border-border/70 bg-background/80 text-foreground">
            {course.credits} hp
          </Badge>
          <Badge className={getCourseLevelBadgeClassName(course.level)}>
            {getCourseLevelLabel(course.level)}
          </Badge>
        </div>

        {conflictReason ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium",
              styles.note
            )}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{conflictReason}</p>
            </div>
          </div>
        ) : null}
      </div>
    </button>
  );
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
  const [selectedChoice, setSelectedChoice] = useState<SelectionChoice | null>(
    null
  );
  const [selectedExistingCourse, setSelectedExistingCourse] =
    useState<Course | null>(null);

  const existingCourseCount = conflictingCourses.length;
  const existingSectionTitle =
    existingCourseCount === 1
      ? "Keep current course"
      : "Keep one of your current courses";
  const existingSectionDescription =
    existingCourseCount === 1
      ? "This course already exists in your profile. Choose it to skip the new course."
      : "Your profile already contains multiple conflicting courses. Select one to represent the existing option and skip the new course.";
  const isConfirmDisabled =
    !selectedChoice ||
    (selectedChoice === "existing" && selectedExistingCourse === null);
  const footerMessage = getSelectionStatusCopy(
    selectedChoice,
    selectedExistingCourse,
    newCourse
  );

  const resetSelectionState = () => {
    setSelectedChoice(null);
    setSelectedExistingCourse(null);
  };

  const handleChooseNew = () => {
    setSelectedChoice("new");
    setSelectedExistingCourse(null);
  };

  const handleChooseExisting = (course: Course) => {
    setSelectedChoice("existing");
    setSelectedExistingCourse(course);
  };

  const handleConfirm = () => {
    if (selectedChoice === "new") {
      onChooseNew(newCourse);
      return;
    }

    if (selectedChoice === "existing" && selectedExistingCourse) {
      onChooseExisting(selectedExistingCourse);
    }
  };

  const handleClose = () => {
    resetSelectionState();
    onClose();
  };

  const handleCancel = () => {
    resetSelectionState();
    onCancel();
  };

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        }
      }}
      open={isOpen}
    >
      <DialogContent
        className="max-h-[calc(100vh-1.5rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto border-0 bg-transparent p-1.5 shadow-none sm:max-h-[92vh] sm:w-full sm:max-w-4xl sm:p-0"
        showCloseButton={false}
      >
        <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-card shadow-lg shadow-black/8 sm:rounded-[2rem] sm:shadow-xl sm:shadow-black/6">
          <Button
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 size-8 rounded-full border border-border/70 bg-background/90 text-muted-foreground hover:bg-muted hover:text-foreground sm:right-4 sm:top-4"
            onClick={handleClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X className="size-4" />
          </Button>

          <div className="relative space-y-6 p-4 sm:space-y-8 sm:p-8">
            <DialogHeader className="space-y-4 text-left">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col items-start gap-3 pr-10 sm:flex-row sm:gap-4 sm:pr-12">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-[1rem] border border-primary/18 bg-primary/6 text-primary sm:size-14 sm:rounded-[1.25rem]">
                    <AlertTriangle className="size-6 sm:size-7" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-primary/18 bg-primary/6 text-primary">
                        Conflict detected
                      </Badge>
                      <Badge className="border-border/70 bg-background text-foreground">
                        {existingCourseCount} existing{" "}
                        {existingCourseCount === 1 ? "course" : "courses"}
                      </Badge>
                    </div>

                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Choose which course stays in your profile
                    </DialogTitle>
                    <DialogDescription className="max-w-3xl text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
                      These courses cannot be taken together. Review the two
                      options below and confirm whether to add{" "}
                      <span className="font-semibold text-foreground">
                        {newCourse.id}
                      </span>{" "}
                      or keep your current selection.
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
              <SelectableCourseCard
                caption="Add new course"
                course={newCourse}
                description="Replace the conflicting selection with this course."
                isSelected={selectedChoice === "new"}
                onSelect={handleChooseNew}
                tone="primary"
              />

              <section className="rounded-[1.35rem] border border-accent/14 bg-card p-4 sm:rounded-[1.75rem] sm:p-6">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-accent/18 bg-accent/6 text-accent">
                        Keep existing
                      </Badge>
                      <Badge className="border-border/70 bg-background text-foreground">
                        {existingCourseCount} option
                        {existingCourseCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                      {existingSectionTitle}
                    </h3>
                    <p className="max-w-2xl text-sm leading-5 text-muted-foreground sm:leading-6">
                      {existingSectionDescription}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {conflictingCourses.map(({ conflictingCourse }) => (
                    <SelectableCourseCard
                      caption="Keep this course"
                      course={conflictingCourse}
                      description="Leave your current profile unchanged and skip the new course."
                      isSelected={
                        selectedChoice === "existing" &&
                        selectedExistingCourse?.id === conflictingCourse.id
                      }
                      key={conflictingCourse.id}
                      onSelect={() => {
                        handleChooseExisting(conflictingCourse);
                      }}
                      tone="accent"
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <p className="max-w-2xl text-sm leading-5 text-muted-foreground sm:leading-6">
                {footerMessage}
              </p>

              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">
                <Button
                  className="h-11 w-full border-border/80 bg-background hover:bg-muted/45 sm:h-auto sm:w-auto"
                  onClick={handleCancel}
                  type="button"
                  variant="outline"
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button
                  className="h-11 w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 sm:h-auto sm:w-auto"
                  disabled={isConfirmDisabled}
                  onClick={handleConfirm}
                  type="button"
                >
                  <Check className="size-4" />
                  Confirm choice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
