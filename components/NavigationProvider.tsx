import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { navigationService } from '@/services';

interface NavigationProviderProps {
  children: React.ReactNode;
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Set the router instance in the navigation service
    navigationService.setRouter(router);
    
    // Initialize navigation event listeners
    navigationService.initialize();

    // Cleanup on unmount
    return () => {
      navigationService.cleanup();
    };
  }, [router]);

  return <>{children}</>;
}
