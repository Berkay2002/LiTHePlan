// hooks/useRealtimeProfiles.ts
'use client'

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/auth-context';

export function useRealtimeProfiles(
  onProfileUpdate: (profile: any) => void,
  onProfileInsert: (profile: any) => void,
  onProfileDelete: (profileId: string) => void
) {
  const { user } = useAuth();

  useEffect(() => {
    // Only run on client-side and when user is authenticated
    if (typeof window === 'undefined' || !user) return;

    console.log('🔄 Setting up Realtime subscription for user:', user.sub);

    const supabase = createClient();
    
    // Subscribe to changes for this user's profiles
    const channel = supabase
      .channel('academic_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'academic_profiles',
          filter: `user_id=eq.${user.sub}`, // Only this user's profiles
        },
        (payload) => {
          console.log('📡 Realtime event received:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              onProfileInsert(payload.new);
              break;
            case 'UPDATE':
              onProfileUpdate(payload.new);
              break;
            case 'DELETE':
              onProfileDelete(payload.old.id);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('🔗 Realtime subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔌 Cleaning up Realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, onProfileUpdate, onProfileInsert, onProfileDelete]);
}