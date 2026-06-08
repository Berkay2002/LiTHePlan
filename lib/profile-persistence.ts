"use client";

import type { User } from "@supabase/supabase-js";
import type { StudentProfile } from "@/types/profile";
import { createClient } from "@/utils/supabase/client";

export const PROFILE_STORAGE_KEY = "student_profile";

export type ProfileUser = Pick<User, "email" | "id">;

export interface ProfileChangeHandlers {
  onDelete: (profileId: string) => void;
  onInsert: (profile: StudentProfile) => void;
  onUpdate: (profile: StudentProfile) => void;
}

export interface LocalProfileStore {
  clear: () => Promise<void> | void;
  load: () => Promise<StudentProfile | null> | StudentProfile | null;
  save: (profile: StudentProfile) => Promise<void> | void;
}

export interface CloudProfileStore {
  load: (user: ProfileUser) => Promise<StudentProfile | null>;
  save: (profile: StudentProfile, user: ProfileUser) => Promise<void>;
}

export interface RealtimeProfileStore {
  subscribe: (
    user: ProfileUser,
    handlers: ProfileChangeHandlers
  ) => (() => void) | undefined;
}

interface ProfilePersistenceOptions {
  cloudStore: CloudProfileStore;
  localStore: LocalProfileStore;
  onCloudLoadError?: (error: unknown) => void;
  onCloudSaveError?: (error: unknown) => void;
  realtimeStore?: RealtimeProfileStore;
}

export interface ProfilePersistence {
  loadProfile: (user: ProfileUser | null) => Promise<StudentProfile | null>;
  saveProfile: (
    profile: StudentProfile,
    user: ProfileUser | null
  ) => Promise<void>;
  subscribeToProfileChanges: (
    user: ProfileUser | null,
    handlers: ProfileChangeHandlers
  ) => () => void;
}

const noop = () => undefined;

export function createProfilePersistence({
  cloudStore,
  localStore,
  onCloudLoadError,
  onCloudSaveError,
  realtimeStore,
}: ProfilePersistenceOptions): ProfilePersistence {
  return {
    async loadProfile(user) {
      if (user) {
        try {
          const cloudProfile = await cloudStore.load(user);
          if (cloudProfile) {
            return cloudProfile;
          }
        } catch (error) {
          onCloudLoadError?.(error);
        }
      }

      return localStore.load();
    },

    async saveProfile(profile, user) {
      if (!user) {
        await localStore.save(profile);
        return;
      }

      try {
        await cloudStore.save(profile, user);
      } catch (error) {
        onCloudSaveError?.(error);
        await localStore.save(profile);
      }
    },

    subscribeToProfileChanges(user, handlers) {
      if (!(user && realtimeStore)) {
        return noop;
      }

      return realtimeStore.subscribe(user, handlers) ?? noop;
    },
  };
}

const reviveProfileDates = (profile: StudentProfile): StudentProfile => ({
  ...profile,
  created_at: new Date(profile.created_at),
  updated_at: new Date(profile.updated_at),
});

export function createLocalProfileStore(
  storage: Pick<Storage, "getItem" | "removeItem" | "setItem">,
  onError: (message: string, error: unknown) => void = console.error
): LocalProfileStore {
  return {
    clear() {
      try {
        storage.removeItem(PROFILE_STORAGE_KEY);
      } catch (error) {
        onError("Failed to clear profile from localStorage", error);
      }
    },

    load() {
      try {
        const profileData = storage.getItem(PROFILE_STORAGE_KEY);
        if (!profileData) {
          return null;
        }

        return reviveProfileDates(JSON.parse(profileData) as StudentProfile);
      } catch (error) {
        onError("Failed to load profile from localStorage", error);
        return null;
      }
    },

    save(profile) {
      try {
        const profileData = {
          ...profile,
          created_at: profile.created_at.toISOString(),
          updated_at: new Date().toISOString(),
        };
        storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
      } catch (error) {
        onError("Failed to save profile to localStorage", error);
      }
    },
  };
}

export function createBrowserProfilePersistence(): ProfilePersistence {
  const localStore = createLocalProfileStore(window.localStorage);

  const cloudStore: CloudProfileStore = {
    async load(user) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const latestProfile = data.at(0)?.profile_data as
        | StudentProfile
        | undefined;
      return latestProfile ? reviveProfileDates(latestProfile) : null;
    },

    async save(profile, user) {
      const supabase = createClient();
      const { data: existing, error: selectError } = await supabase
        .from("academic_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        throw selectError;
      }

      if (existing) {
        const { error } = await supabase
          .from("academic_profiles")
          .update({
            profile_data: profile,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) {
          throw error;
        }
        return;
      }

      const { error } = await supabase.from("academic_profiles").insert({
        is_public: true,
        name: profile.name || "My Course Profile",
        profile_data: profile,
        user_id: user.id,
      });

      if (error) {
        throw error;
      }
    },
  };

  const realtimeStore: RealtimeProfileStore = {
    subscribe(user, handlers) {
      const supabase = createClient();
      const channel = supabase
        .channel("academic_profiles_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            filter: `user_id=eq.${user.id}`,
            schema: "public",
            table: "academic_profiles",
          },
          (payload) => {
            switch (payload.eventType) {
              case "DELETE":
                handlers.onDelete(String(payload.old.id));
                break;
              case "INSERT":
                handlers.onInsert(
                  reviveProfileDates(payload.new.profile_data as StudentProfile)
                );
                break;
              case "UPDATE":
                handlers.onUpdate(
                  reviveProfileDates(payload.new.profile_data as StudentProfile)
                );
                break;
              default:
                break;
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  };

  return createProfilePersistence({
    cloudStore,
    localStore,
    onCloudLoadError: (error) => {
      console.error(
        "Failed to load profile from cloud, falling back to localStorage:",
        error
      );
    },
    onCloudSaveError: (error) => {
      console.error(
        "Failed to save profile to cloud, falling back to localStorage:",
        error
      );
    },
    realtimeStore,
  });
}
