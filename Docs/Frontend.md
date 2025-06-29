# Frontend PWA Development (React)

## Objective
Build a single, responsive PWA that provides a seamless user experience across all devices.

## Phases & Tasks

### Phase 1 (MVP - Personal Budgeting)

#### PWA Foundation
- Initialize a new React project using a template with PWA support (e.g., Vite PWA).
- Configure the manifest.json and service worker caching strategy.

#### UI/UX & Layout
- Select and set up a UI component library or CSS framework.
- Create a main app layout component with responsive navigation (e.g., bottom nav with Wallet, Budgets, Insights).

#### Authentication
- Install and configure an OIDC client library like oidc-client-ts.
- Create an AuthService module and a ProtectedRoute component.
- Build the UI for the login and callback pages.

#### State Management & Core Features
- Select and configure a state management library (e.g., Zustand, Redux Toolkit).
- Build a "Wallet" page to list and manage Accounts.
- Build a "Budgets" page to display budget progress.
- Update the reusable forms for adding/editing expenses and incomes to include an Account selector.
- Connect all components to the state management store and the backend API.

### Phase 2 (V2 - Collaboration)

#### Space Management UI
- Create a "Manage Spaces" page with forms and lists for creating spaces and managing members.

#### Space Switching
- Implement a space-switcher dropdown or menu in the main navigation UI.
