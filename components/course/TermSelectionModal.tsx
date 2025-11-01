import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type MasterProgramTerm } from "@/lib/profile-constants";
import type { Course } from "@/types/course";

interface TermSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  availableTerms: MasterProgramTerm[];
  onTermSelected: (course: Course, selectedTerm: MasterProgramTerm) => void;
}

export function TermSelectionModal({
  isOpen,
  onClose,
  course,
  availableTerms,
  onTermSelected,
}: TermSelectionModalProps) {
  const termDescriptions: Record<MasterProgramTerm, string> = {
    7: "First Year",
    8: "Second Year",
    9: "Third Year",
  };

  const handleTermSelect = (term: MasterProgramTerm) => {
    if (course) {
      onTermSelected(course, term);
      onClose();
    }
  };

  if (!course) return null;

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Select Term for Course
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg text-foreground">{course.name}</h3>
            <p className="text-sm text-muted-foreground">{course.id}</p>
          </div>

          {/* Term Selection */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Click a term to add this course to your profile:
            </p>

            <div className="grid gap-2">
              {availableTerms.map((term) => (
                <Button
                  className="justify-start h-auto p-4 text-foreground border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                  key={term}
                  onClick={() => handleTermSelect(term)}
                  variant="outline"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Term {term}</div>
                      <div className="text-sm opacity-70">
                        {termDescriptions[term]}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
