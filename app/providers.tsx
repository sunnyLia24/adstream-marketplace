/**
 * =============================================================================
 * CLIENT-SIDE PROVIDERS COMPONENT
 * =============================================================================
 *
 * This component wraps the application with necessary client-side providers.
 * Currently, it includes NextAuth's SessionProvider for authentication state.
 *
 * WHY 'use client'?
 * -----------------
 * Next.js 13+ uses React Server Components by default. The SessionProvider
 * from NextAuth requires client-side React features (Context, hooks), so we
 * must mark this component as a Client Component with 'use client'.
 *
 * WHAT PROVIDERS DO:
 * ------------------
 * Providers use React Context to share state across the component tree without
 * passing props manually at every level. Common uses:
 * - Authentication state (SessionProvider)
 * - Theme/dark mode preferences
 * - Global application state
 * - Internationalization (i18n)
 *
 * SESSION PROVIDER:
 * -----------------
 * The SessionProvider from NextAuth:
 * 1. Makes the user session available throughout the app
 * 2. Enables the useSession() hook in any component
 * 3. Handles automatic session refresh
 * 4. Provides session status ('loading', 'authenticated', 'unauthenticated')
 *
 * USAGE IN OTHER COMPONENTS:
 * --------------------------
 * Once wrapped with SessionProvider, any component can access session:
 *
 *   import { useSession } from 'next-auth/react';
 *
 *   function MyComponent() {
 *     const { data: session, status } = useSession();
 *
 *     if (status === 'loading') return <Loading />;
 *     if (status === 'unauthenticated') return <SignInPrompt />;
 *
 *     return <div>Welcome, {session.user.name}!</div>;
 *   }
 *
 * ADDING MORE PROVIDERS:
 * ----------------------
 * To add more providers (e.g., theme, state management), nest them:
 *
 *   export function Providers({ children }: { children: React.ReactNode }) {
 *     return (
 *       <SessionProvider>
 *         <ThemeProvider>
 *           <StoreProvider>
 *             {children}
 *           </StoreProvider>
 *         </ThemeProvider>
 *       </SessionProvider>
 *     );
 *   }
 */

'use client'; // Mark as Client Component for React Context/hooks support

import { SessionProvider } from 'next-auth/react';

/**
 * Providers Component
 *
 * Wraps the application with all necessary client-side providers.
 * This component is used in app/layout.tsx to wrap all pages.
 *
 * @param children - All child components that need access to providers
 * @returns Children wrapped with SessionProvider (and any future providers)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
