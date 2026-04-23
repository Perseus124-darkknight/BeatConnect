import '../../global.css'; // NativeWind v4 initialization
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return; // Wait until navigation is fully mounted
    
    const inAuthGroup = segments[0] === '(admin)';

    if (!isAuthenticated && inAuthGroup) {
      setTimeout(() => router.replace('/'), 0);
    } else if (isAuthenticated && !inAuthGroup) {
      setTimeout(() => router.replace('/(admin)/dashboard'), 0);
    }
  }, [isAuthenticated, segments, navigationState]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Admin Login' }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
    </Stack>
  );
}
