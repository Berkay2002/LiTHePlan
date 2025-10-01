// app/profile/edit/TermCards.tsx

import { DraggableTermCard } from "@/components/DraggableTermCard";
import { EditableTermCard } from "@/components/EditableTermCard";
import {
  IMMUTABLE_MASTER_PROGRAM_TERMS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import type { StudentProfile } from "@/types/profile";

interface TermCardsProps {
  currentProfile: StudentProfile;
  isMobile: boolean;
  showBlockTimeline: boolean;
  onClearTerm: (term: MasterProgramTerm) => void;
  onMoveCourse?: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => void;
  onRemoveCourse: (courseId: string) => void;
}

export function TermCards({
  currentProfile,
  isMobile,
  onClearTerm,
  onMoveCourse,
  onRemoveCourse,
  showBlockTimeline,
}: TermCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {MASTER_PROGRAM_TERMS.map((term) => {
        const courses = currentProfile.terms[term];
        const isImmutable = IMMUTABLE_MASTER_PROGRAM_TERMS.includes(term);

        if (isMobile) {
          return (
            <EditableTermCard
              key={term}
              courses={courses}
              onClearTerm={onClearTerm}
              onMoveCourse={isImmutable ? undefined : onMoveCourse}
              onRemoveCourse={onRemoveCourse}
              showBlockTimeline={showBlockTimeline}
              termNumber={term}
            />
          );
        }

        return (
          <DraggableTermCard
            key={term}
            courses={courses}
            isDragDisabled={isImmutable}
            onClearTerm={onClearTerm}
            onMoveCourse={isImmutable ? undefined : onMoveCourse}
            onRemoveCourse={onRemoveCourse}
            showBlockTimeline={showBlockTimeline}
            termNumber={term}
          />
        );
      })}
    </div>
  );
}
