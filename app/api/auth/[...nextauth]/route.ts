/**
 * =============================================================================
 * NEXTAUTH AUTHENTICATION CONFIGURATION
 * =============================================================================
 *
 * This file configures NextAuth.js, the authentication library used by AdStream.
 * It sets up two authentication providers and handles session management.
 *
 * AUTHENTICATION PROVIDERS:
 * -------------------------
 *
 * 1. GOOGLE OAUTH PROVIDER
 *    - Allows users to sign in with their Google/YouTube account
 *    - Primarily used by creators to connect their YouTube channels
 *    - Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables
 *
 * 2. CREDENTIALS PROVIDER
 *    - Traditional email/password authentication
 *    - Used by both creators and brands
 *    - Passwords are hashed with bcrypt (10 rounds)
 *    - Validates credentials against the database
 *
 * SESSION STRATEGY:
 * -----------------
 * Uses JWT (JSON Web Token) strategy instead of database sessions.
 * This means:
 * - Sessions are stored in encrypted cookies, not in the database
 * - More scalable (no database queries for session validation)
 * - Stateless authentication (good for serverless environments)
 *
 * CALLBACKS:
 * ----------
 * - jwt: Adds user ID to the JWT token when user signs in
 * - session: Adds user ID to the session object from the JWT
 *
 * These callbacks ensure the user ID is available in the session,
 * which is needed for database queries in API routes.
 *
 * CUSTOM PAGES:
 * -------------
 * - signIn: '/auth/signin' - Custom sign-in page instead of NextAuth default
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * -------------------------------
 * - GOOGLE_CLIENT_ID: OAuth client ID from Google Cloud Console
 * - GOOGLE_CLIENT_SECRET: OAuth client secret from Google Cloud Console
 * - NEXTAUTH_SECRET: Secret key for encrypting JWTs (should be a random string)
 * - NEXTAUTH_URL: Base URL of the application (e.g., http://localhost:3000)
 *
 * HOW AUTHENTICATION WORKS:
 * -------------------------
 * 1. User enters credentials or clicks Google sign-in
 * 2. Credentials provider validates email/password against database
 * 3. If valid, NextAuth creates a JWT with user info
 * 4. JWT is stored in an HTTP-only cookie
 * 5. Subsequent requests include the cookie for authentication
 * 6. getServerSession() reads the JWT to identify the user
 */

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * NextAuth configuration object
 *
 * This configures all aspects of authentication including providers,
 * session strategy, callbacks, and custom pages.
 */
const handler = NextAuth({
  // Prisma adapter for database integration (used by OAuth providers)
  adapter: PrismaAdapter(prisma),

  // =========================================================================
  // AUTHENTICATION PROVIDERS
  // =========================================================================
  providers: [
    /**
     * Google OAuth Provider
     *
     * Enables "Sign in with Google" functionality.
     * Used primarily by creators to connect YouTube accounts.
     */
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    }),

    /**
     * Credentials Provider
     *
     * Traditional email/password authentication.
     * The authorize function validates credentials against the database.
     */
    CredentialsProvider({
      name: 'credentials',
      // Define the expected credential fields
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * Authorize function - validates user credentials
       *
       * @param credentials - Email and password from the sign-in form
       * @returns User object if valid, null if invalid
       */
      async authorize(credentials) {
        // Ensure both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Look up user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // User not found or no password set (OAuth user)
        if (!user || !user.passwordHash) {
          return null;
        }

        // Compare provided password with stored hash
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        // Invalid password
        if (!isValid) {
          return null;
        }

        // Return user object (will be encoded in JWT)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // =========================================================================
  // SESSION CONFIGURATION
  // =========================================================================

  /**
   * Use JWT strategy for sessions
   *
   * JWTs are stored in HTTP-only cookies and don't require
   * database queries for validation. This is ideal for
   * serverless environments like Vercel.
   */
  session: {
    strategy: 'jwt',
  },

  // =========================================================================
  // CUSTOM PAGES
  // =========================================================================

  /**
   * Custom authentication pages
   *
   * Override NextAuth's default pages with our custom UI.
   */
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
  },

  // =========================================================================
  // CALLBACKS
  // =========================================================================
  callbacks: {
    /**
     * JWT Callback
     *
     * Called when JWT is created (sign in) or updated (session refresh).
     * Adds user ID to the token so it's available in the session.
     *
     * @param token - The JWT being created/updated
     * @param user - The user object (only on sign in)
     * @returns Modified token with user ID
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    /**
     * Session Callback
     *
     * Called when session is read. Transfers user ID from JWT to session.
     * This makes the user ID available via useSession() hook.
     *
     * @param session - The session object
     * @param token - The JWT token
     * @returns Modified session with user ID
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // =========================================================================
  // SECURITY
  // =========================================================================

  /**
   * Secret key for JWT encryption
   *
   * IMPORTANT: In production, set NEXTAUTH_SECRET to a secure random string.
   * You can generate one with: openssl rand -base64 32
   */
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
});

/**
 * Export handler for both GET and POST requests
 *
 * NextAuth uses GET for callbacks (OAuth redirects)
 * and POST for sign-in/sign-out operations.
 */
export { handler as GET, handler as POST };
