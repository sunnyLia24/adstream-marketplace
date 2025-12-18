/**
 * =============================================================================
 * SIGN IN PAGE COMPONENT
 * =============================================================================
 *
 * This is the authentication page where existing users can sign in to AdStream.
 * It supports two user types (Creator and Brand) and two auth methods:
 * 1. Email/Password authentication (via NextAuth Credentials provider)
 * 2. Google/YouTube OAuth (for Creators only)
 *
 * PAGE FLOW:
 * ----------
 * 1. User selects their account type (Creator or Brand)
 * 2. Creator can use Google OAuth or Email/Password
 * 3. Brand uses Email/Password only
 * 4. On success, redirects to appropriate dashboard:
 *    - Creators → /creator/dashboard
 *    - Brands → /brand/discover
 *
 * COMPONENT STRUCTURE:
 * --------------------
 * - Logo and branding header
 * - User type toggle (Creator/Brand tabs)
 * - Google OAuth button (Creators only)
 * - Divider with "Or continue with email"
 * - Email/Password form
 * - Error message display
 * - Sign up link for new users
 *
 * STATE MANAGEMENT:
 * -----------------
 * - userType: 'creator' | 'brand' - Selected account type
 * - email/password: Form input values
 * - loading: Shows loading state during auth
 * - error: Error message to display
 *
 * NEXT.JS/NEXTAUTH INTEGRATION:
 * -----------------------------
 * - 'use client': Required for React hooks (useState, etc.)
 * - signIn from 'next-auth/react': Handles authentication
 * - redirect: false: Prevents automatic redirect to handle errors
 * - useRouter: For programmatic navigation on success
 */

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Youtube, Mail, Lock, Building2, User } from 'lucide-react';

/**
 * SignInPage Component
 *
 * Handles user authentication with support for both creators and brands.
 * Creators can use Google OAuth, while both types can use email/password.
 *
 * @returns The sign-in page with authentication forms
 */
export default function SignInPage() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Track selected user type - determines which dashboard to redirect to
  const [userType, setUserType] = useState<'creator' | 'brand'>('creator');

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Next.js router for programmatic navigation
  const router = useRouter();

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle email/password sign in
   *
   * Uses NextAuth's credentials provider to authenticate.
   * On success, redirects to the appropriate dashboard based on user type.
   *
   * @param e - Form submit event
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt to sign in with credentials
      // redirect: false prevents automatic redirect so we can handle errors
      const result = await signIn('credentials', {
        email,
        password,
        userType,
        redirect: false,
      });

      if (result?.error) {
        // Authentication failed
        setError('Invalid credentials');
      } else {
        // Success - redirect to appropriate dashboard
        router.push(userType === 'creator' ? '/creator/dashboard' : '/brand/discover');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth sign in (for Creators)
   *
   * Initiates Google OAuth flow through NextAuth.
   * This allows creators to sign in with their YouTube/Google account.
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    // callbackUrl determines where user goes after OAuth completes
    await signIn('google', {
      callbackUrl: userType === 'creator' ? '/creator/dashboard' : '/brand/discover',
    });
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    // Full-page container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* =====================================================================
            HEADER - Logo and Welcome Message
            =====================================================================
        */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-3xl font-bold text-white">AdStream</span>
          </div>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        {/* =====================================================================
            USER TYPE TOGGLE
            =====================================================================
            Segmented control to switch between Creator and Brand sign-in.
            This determines OAuth options and post-login redirect destination.
        */}
        <div className="bg-slate-800/50 rounded-lg p-1 mb-6 flex gap-1">
          {/* Creator option */}
          <button
            onClick={() => setUserType('creator')}
            className={`flex-1 py-3 rounded-md font-medium transition ${
              userType === 'creator'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Creator
          </button>
          {/* Brand option */}
          <button
            onClick={() => setUserType('brand')}
            className={`flex-1 py-3 rounded-md font-medium transition ${
              userType === 'brand'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-2" />
            Brand
          </button>
        </div>

        {/* =====================================================================
            SIGN IN FORM CARD
            =====================================================================
        */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">

          {/* Google OAuth button - Only shown for Creators */}
          {userType === 'creator' && (
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mb-4 transition disabled:opacity-50"
            >
              <Youtube className="w-5 h-5 text-red-600" />
              Continue with YouTube
            </button>
          )}

          {/* Divider between OAuth and email options */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Email/Password form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {/* Email input with icon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password input with icon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Remember me checkbox and forgot password link */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300">
                <input type="checkbox" className="mr-2 rounded" />
                Remember me
              </label>
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Forgot password?
              </a>
            </div>

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Link to sign up page for new users */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
