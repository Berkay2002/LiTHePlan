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
  onClearTerm: (term: MasterProgramTerm) => Promise<void>;
  onMoveCourse: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => Promise<void>;
  onRemoveCourse: (courseId: string) => Promise<void>;
}

export function TermCards({
  currentProfile,
  isMobile,
  onClearTerm,
  onMoveCourse,
  onRemoveCourse,
  showBlockTimeline,
}: TermCardsProps) {
  const handleClearTerm = (term: MasterProgramTerm) => {
    void onClearTerm(term);
  };

  const handleMoveCourse = (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => {
    void onMoveCourse(courseId, fromTerm, toTerm);
  };

  const handleRemoveCourse = (courseId: string) => {
    void onRemoveCourse(courseId);
  };

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
              onClearTerm={handleClearTerm}
              onMoveCourse={isImmutable ? undefined : handleMoveCourse}
              onRemoveCourse={handleRemoveCourse}
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
            onClearTerm={handleClearTerm}
            onMoveCourse={isImmutable ? undefined : handleMoveCourse}
            onRemoveCourse={handleRemoveCourse}
            showBlockTimeline={showBlockTimeline}
            termNumber={term}
          />
        );
      })}
    </div>
  );
}
