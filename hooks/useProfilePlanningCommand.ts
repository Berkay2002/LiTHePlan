"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProfile } from "@/components/profile/ProfileContext";
import type { MasterProgramTerm } from "@/lib/profile-constants";
import {
  type CourseProfileConflict,
  type CourseProfilePlanningDecision,
  getCourseProfileActionState,
  planCourseProfileAdd,
  planCourseProfileAddAfterConflictResolution,
} from "@/lib/profile-planning-command";
import { isCourseInProfile } from "@/lib/profile-utils";
import type { Course } from "@/types/course";

interface UseProfilePlanningCommandOptions {
  onAdded?: () => void;
  onRemoved?: () => void;
}

type PostConflictDecision = Extract<
  CourseProfilePlanningDecision,
  { type: "ready-to-add" | "term-selection-required" }
>;

interface PendingConflictReplacement {
  decision: PostConflictDecision;
  remainingConflictIds: string[];
}

interface TermModalState {
  availableTerms: MasterProgramTerm[];
  course: Course | null;
  isOpen: boolean;
}

interface ConflictModalState {
  conflicts: CourseProfileConflict[];
  course: Course | null;
  isOpen: boolean;
}

export function useProfilePlanningCommand(
  course: Course,
  options: UseProfilePlanningCommandOptions = {}
) {
  const { onAdded, onRemoved } = options;
  const { addCourse, removeCourse, state } = useProfile();
  const currentProfile = state.current_profile;
  const [termModalState, setTermModalState] = useState<TermModalState>({
    availableTerms: [],
    course: null,
    isOpen: false,
  });
  const [conflictModalState, setConflictModalState] =
    useState<ConflictModalState>({
      conflicts: [],
      course: null,
      isOpen: false,
    });
  const [pendingReplacement, setPendingReplacement] =
    useState<PendingConflictReplacement | null>(null);
  const isProcessingPendingReplacement = useRef(false);

  const actionState = useMemo(
    () => getCourseProfileActionState(currentProfile, course),
    [course, currentProfile]
  );

  const closeTermModal = useCallback(() => {
    setTermModalState({
      availableTerms: [],
      course: null,
      isOpen: false,
    });
  }, []);

  const closeConflictModal = useCallback(() => {
    setConflictModalState({
      conflicts: [],
      course: null,
      isOpen: false,
    });
  }, []);

  const handleDecision = useCallback(
    async (decision: CourseProfilePlanningDecision) => {
      switch (decision.type) {
        case "already-in-profile":
        case "invalid-term":
          return;

        case "conflict-resolution-required":
          setConflictModalState({
            conflicts: decision.conflicts,
            course: decision.course,
            isOpen: true,
          });
          return;

        case "term-selection-required":
          setTermModalState({
            availableTerms: decision.availableTerms,
            course: decision.course,
            isOpen: true,
          });
          return;

        case "ready-to-add":
          await addCourse(decision.course, decision.term);
          onAdded?.();
          return;

        default:
          return;
      }
    },
    [addCourse, onAdded]
  );

  useEffect(() => {
    if (!pendingReplacement || isProcessingPendingReplacement.current) {
      return;
    }

    const [nextConflictId, ...remainingConflictIds] =
      pendingReplacement.remainingConflictIds;

    if (!nextConflictId) {
      isProcessingPendingReplacement.current = true;

      const completePendingReplacement = async () => {
        try {
          await handleDecision(pendingReplacement.decision);
        } finally {
          setPendingReplacement(null);
          isProcessingPendingReplacement.current = false;
        }
      };

      completePendingReplacement().catch(() => {
        setPendingReplacement(null);
        isProcessingPendingReplacement.current = false;
      });
      return;
    }

    if (currentProfile && !isCourseInProfile(currentProfile, nextConflictId)) {
      setPendingReplacement({
        ...pendingReplacement,
        remainingConflictIds,
      });
      return;
    }

    isProcessingPendingReplacement.current = true;

    const removeNextConflict = async () => {
      try {
        await removeCourse(nextConflictId);
        setPendingReplacement({
          ...pendingReplacement,
          remainingConflictIds,
        });
      } catch {
        setPendingReplacement(null);
      } finally {
        isProcessingPendingReplacement.current = false;
      }
    };

    removeNextConflict().catch(() => {
      setPendingReplacement(null);
      isProcessingPendingReplacement.current = false;
    });
  }, [currentProfile, handleDecision, pendingReplacement, removeCourse]);

  const requestAdd = useCallback(async () => {
    await handleDecision(planCourseProfileAdd(currentProfile, course));
  }, [course, currentProfile, handleDecision]);

  const requestRemove = useCallback(async () => {
    await removeCourse(course.id);
    onRemoved?.();
  }, [course.id, onRemoved, removeCourse]);

  const handleTermSelected = useCallback(
    async (selectedCourse: Course, selectedTerm: MasterProgramTerm) => {
      closeTermModal();
      await addCourse(selectedCourse, selectedTerm);
      onAdded?.();
    },
    [addCourse, closeTermModal, onAdded]
  );

  const handleChooseNew = useCallback(
    async (newCourse: Course) => {
      const conflictIds = conflictModalState.conflicts.map(
        (conflict) => conflict.conflictingCourseId
      );
      closeConflictModal();

      const nextDecision =
        planCourseProfileAddAfterConflictResolution(newCourse);

      if (nextDecision.type === "invalid-term") {
        return;
      }

      if (conflictIds.length === 0) {
        await handleDecision(nextDecision);
        return;
      }

      setPendingReplacement({
        decision: nextDecision,
        remainingConflictIds: conflictIds,
      });
    },
    [closeConflictModal, conflictModalState.conflicts, handleDecision]
  );

  return {
    actionState,
    conflictModal: {
      conflictingCourses: conflictModalState.conflicts,
      isOpen: conflictModalState.isOpen,
      newCourse: conflictModalState.course ?? course,
      onCancel: closeConflictModal,
      onChooseExisting: closeConflictModal,
      onChooseNew: handleChooseNew,
      onClose: closeConflictModal,
    },
    requestAdd,
    requestRemove,
    termModal: {
      availableTerms: termModalState.availableTerms,
      course: termModalState.course,
      isOpen: termModalState.isOpen,
      onClose: closeTermModal,
      onTermSelected: handleTermSelected,
    },
  };
}
