# Navigation Service

This service provides a centralized way to handle navigation events, particularly for handling 401 unauthorized responses from the API.

## Features

- **Automatic 401 Handling**: When the API returns a 401 status, the system automatically:
  1. Attempts to refresh the access token
  2. If refresh fails, clears stored tokens
  3. Redirects the user to the login page

- **Event-Based Navigation**: Uses an event emitter system to decouple navigation logic from API services

- **Manual Navigation**: Provides utility functions to manually trigger navigation from anywhere in the app

## How It Works

### 1. Automatic 401 Handling

The `ApiClient` automatically detects 401 responses and handles them:

```typescript
// In ApiClient.ts - this happens automatically
if (response.status === 401) {
  await this.handleUnauthorizedResponse();
}
```

### 2. Navigation Event System

When a 401 occurs, the system emits a navigation event:

```typescript
navigationEventEmitter.emit('redirectToLogin');
```

### 3. Navigation Service Listens

The `NavigationService` listens to these events and performs the actual navigation:

```typescript
navigationEventEmitter.addListener('redirectToLogin', () => {
  this.redirectToLogin();
});
```

## Usage

### Automatic Usage (No Code Required)

The system works automatically - when any API call returns 401, the user will be redirected to login.

### Manual Navigation

You can manually trigger navigation from anywhere in your app:

```typescript
import { redirectToLogin, redirectToOnboarding } from '@/services';

// Redirect to login
redirectToLogin();

// Redirect to onboarding
redirectToOnboarding();
```

### In Components

```typescript
import { navigationService } from '@/services';

// Set router (usually done automatically by NavigationProvider)
navigationService.setRouter(router);

// Manual navigation
navigationService.navigateToLogin();
navigationService.navigateToOnboarding();
```

## Setup

The `NavigationProvider` component automatically sets up the navigation service in the root layout:

```typescript
// In _layout.tsx
<NavigationProvider>
  <Stack>
    {/* Your app screens */}
  </Stack>
</NavigationProvider>
```

## Error Handling

The system handles several scenarios:

1. **Valid refresh token**: Attempts to refresh the access token
2. **Invalid/expired refresh token**: Clears tokens and redirects to login
3. **No refresh token**: Immediately redirects to login
4. **Network errors during refresh**: Clears tokens and redirects to login

## Logging

The system provides detailed logging for debugging:

- Token refresh attempts
- Success/failure of token refresh
- Navigation events
- Token clearing operations

## Security

- Tokens are cleared from both AsyncStorage and SecureStore
- Navigation events are handled securely through the event system
- No sensitive data is exposed in logs
