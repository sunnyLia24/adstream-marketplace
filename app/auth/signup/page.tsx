/**
 * =============================================================================
 * SIGN UP PAGE COMPONENT
 * =============================================================================
 *
 * This is the registration page where new users create an AdStream account.
 * It supports two user types with different form fields:
 *
 * CREATOR REGISTRATION:
 * - Full Name
 * - Email
 * - Password + Confirm Password
 *
 * BRAND REGISTRATION:
 * - Your Name (contact person)
 * - Company Name (required for brands)
 * - Email
 * - Password + Confirm Password
 *
 * REGISTRATION FLOW:
 * ------------------
 * 1. User selects account type (Creator or Brand)
 * 2. User fills out the appropriate form
 * 3. Form is validated (password match, required fields)
 * 4. POST request to /api/auth/signup creates the account
 * 5. On success, redirect to sign-in page with ?registered=true
 * 6. User signs in with their new credentials
 *
 * API INTEGRATION:
 * ----------------
 * The signup form calls POST /api/auth/signup with:
 * {
 *   name: string,
 *   email: string,
 *   password: string,
 *   userType: 'creator' | 'brand',
 *   companyName?: string (required for brands)
 * }
 *
 * The API creates:
 * - User record with hashed password
 * - Creator or Brand profile based on userType
 *
 * VALIDATION:
 * -----------
 * - Client-side: Password confirmation match
 * - Server-side: Email uniqueness, required fields, password hashing
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Building2, User } from 'lucide-react';

/**
 * SignUpPage Component
 *
 * Handles new user registration for both creators and brands.
 * Brands have an additional required field for company name.
 *
 * @returns The sign-up page with registration form
 */
export default function SignUpPage() {
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  // Track selected user type - affects form fields and API payload
  const [userType, setUserType] = useState<'creator' | 'brand'>('creator');

  // Form data - includes all fields, companyName only used for brands
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '', // Only required for brand accounts
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Next.js router for programmatic navigation
  const router = useRouter();

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle form submission for account creation
   *
   * Validates password match, then calls the signup API.
   * On success, redirects to sign-in page.
   *
   * @param e - Form submit event
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation: Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Send registration request to API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userType, // Include the selected user type
        }),
      });

      const data = await response.json();

      // Check for API errors
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Success - redirect to sign-in page with success indicator
      // The ?registered=true query param can be used to show a success message
      router.push('/auth/signin?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <p className="text-gray-300">Create your account</p>
        </div>

        {/* =====================================================================
            USER TYPE TOGGLE
            =====================================================================
            Segmented control to switch between Creator and Brand registration.
            This determines which form fields are shown.
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
            REGISTRATION FORM CARD
            =====================================================================
        */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">

          {/* Error message display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Name field - label changes based on user type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {userType === 'creator' ? 'Full Name' : 'Your Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Company Name field - Only shown for Brand accounts */}
            {userType === 'brand' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                  placeholder="Acme Inc."
                  required
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password field with minimum length requirement */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="••••••••"
                required
                minLength={8} // Minimum 8 characters for security
              />
            </div>

            {/* Confirm Password field for verification */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Link to sign-in page for existing users */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <a href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
