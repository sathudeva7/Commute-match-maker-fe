import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services';
import { User } from '@/types/api';

export default function RootGate() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAndRoute = async () => {
      try {
        const isAuthed = await authService.isAuthenticated();
        if (!isAuthed) {
          router.replace('/(tabs)/login');
          return;
        }

        let user: User | null = null;
        try {
          user = await authService.getCurrentUser();
        } catch (e) {
          // If fetching profile fails, send to onboarding
          router.replace('/(tabs)/onboarding');
          return;
        }

        const profileComplete = Boolean(
          user?.full_name &&
          user?.phone_number &&
          user?.date_of_birth &&
          user?.bio &&
          user?.matching_preferences?.preferred_commute_time?.start &&
          user?.matching_preferences?.preferred_commute_time?.end &&
          (user?.matching_preferences?.preferred_commute_days?.length ?? 0) > 0
        );

        if (!profileComplete) {
          router.replace('/(tabs)/onboarding');
          return;
        }

        // Profile complete → go to select journey
        router.replace('/(tabs)/SelectJourney');
      } finally {
        setChecking(false);
      }
    };

    checkAndRoute();
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
