import { navigationEventEmitter } from './ApiClient';

// Navigation service that handles navigation events from services
class NavigationService {
  private router: any = null;

  // Set the router instance (should be called from components)
  setRouter(router: any) {
    this.router = router;
  }

  // Initialize navigation event listeners
  initialize() {
    // Listen for redirect to login events
    navigationEventEmitter.addListener('redirectToLogin', () => {
      this.redirectToLogin();
    });

    // Listen for redirect to onboarding events
    navigationEventEmitter.addListener('redirectToOnboarding', () => {
      this.redirectToOnboarding();
    });
  }

  // Clean up event listeners
  cleanup() {
    navigationEventEmitter.removeListener('redirectToLogin', () => {
      this.redirectToLogin();
    });
    navigationEventEmitter.removeListener('redirectToOnboarding', () => {
      this.redirectToOnboarding();
    });
  }

  // Redirect to login page
  private redirectToLogin() {
    if (this.router) {
      console.log('Redirecting to login page due to 401 response');
      this.router.replace('/(tabs)/login');
    } else {
      console.warn('Router not set, cannot redirect to login');
    }
  }

  // Redirect to onboarding page
  private redirectToOnboarding() {
    if (this.router) {
      console.log('Redirecting to onboarding page');
      this.router.replace('/(tabs)/onboarding');
    } else {
      console.warn('Router not set, cannot redirect to onboarding');
    }
  }

  // Manual navigation methods
  navigateToLogin() {
    this.redirectToLogin();
  }

  navigateToOnboarding() {
    this.redirectToOnboarding();
  }

  // Static method to emit navigation events (can be called from anywhere)
  static redirectToLogin() {
    navigationEventEmitter.emit('redirectToLogin');
  }

  static redirectToOnboarding() {
    navigationEventEmitter.emit('redirectToOnboarding');
  }
}

// Create singleton instance
export const navigationService = new NavigationService();
