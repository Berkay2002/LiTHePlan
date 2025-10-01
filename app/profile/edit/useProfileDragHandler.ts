'use client'

// app/profile/edit/useProfileDragHandler.ts

import { type DropResult } from "@hello-pangea/dnd";
import { useCallback } from "react";
import {
  IMMUTABLE_MASTER_PROGRAM_TERMS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";

const TERM_ID_PATTERN = /term-(\d+)(?:-period-\d+)?$/;

const parseTermFromMatch = (
  match: RegExpMatchArray | null
): MasterProgramTerm | null => {
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  return MASTER_PROGRAM_TERMS.find((term) => term === parsed) ?? null;
};

export function useProfileDragHandler(
  moveCourse: (
    courseId: string,
    fromTerm: MasterProgramTerm,
    toTerm: MasterProgramTerm
  ) => Promise<void>
) {
  return useCallback(
    async ({ destination, source, draggableId }: DropResult) => {
      if (!destination) {
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const courseId = draggableId.split("-term")[0];

      const sourceTerm = parseTermFromMatch(source.droppableId.match(TERM_ID_PATTERN));
      const destTerm = parseTermFromMatch(
        destination.droppableId.match(TERM_ID_PATTERN)
      );

      if (!(sourceTerm && destTerm)) {
        return;
      }

      if (
        IMMUTABLE_MASTER_PROGRAM_TERMS.includes(sourceTerm) ||
        IMMUTABLE_MASTER_PROGRAM_TERMS.includes(destTerm)
      ) {
        return;
      }

      if (sourceTerm !== destTerm) {
        try {
          await moveCourse(courseId, sourceTerm, destTerm);
        } catch (error) {
          console.error("Failed to move course:", error);
        }
      }
    },
    [moveCourse]
  );
}
