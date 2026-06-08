import { describe, expect, it, vi } from "vitest";
import type { StudentProfile } from "../types/profile";
import type { MasterProgramTerm } from "./profile-constants";
import {
  createProfilePersistence,
  type ProfileUser,
} from "./profile-persistence";

const createProfile = (): StudentProfile => ({
  created_at: new Date("2026-01-01T00:00:00.000Z"),
  id: "profile-1",
  metadata: {
    advanced_credits: 0,
    is_valid: true,
    total_credits: 0,
  },
  name: "My Master's Plan",
  terms: {
    7: [],
    8: [],
    9: [],
  } as Record<MasterProgramTerm, StudentProfile["terms"][MasterProgramTerm]>,
  updated_at: new Date("2026-01-02T00:00:00.000Z"),
});

describe("createProfilePersistence", () => {
  it("falls back to local storage when authenticated cloud save fails", async () => {
    const profile = createProfile();
    const saveLocal = vi
      .fn<(profile: StudentProfile) => Promise<void>>()
      .mockResolvedValue();
    const saveCloud = vi
      .fn<(profile: StudentProfile, user: ProfileUser) => Promise<void>>()
      .mockRejectedValue(new Error("cloud unavailable"));

    const persistence = createProfilePersistence({
      cloudStore: {
        load: vi.fn(),
        save: saveCloud,
      },
      localStore: {
        clear: vi.fn(),
        load: vi.fn(),
        save: saveLocal,
      },
    });

    await persistence.saveProfile(profile, {
      email: "student@example.com",
      id: "user-1",
    });

    expect(saveCloud).toHaveBeenCalledWith(profile, {
      email: "student@example.com",
      id: "user-1",
    });
    expect(saveLocal).toHaveBeenCalledWith(profile);
  });
});
