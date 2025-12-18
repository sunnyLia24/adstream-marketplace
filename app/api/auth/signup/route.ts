/**
 * =============================================================================
 * USER REGISTRATION API ENDPOINT
 * =============================================================================
 *
 * POST /api/auth/signup
 *
 * This endpoint handles new user registration for both creators and brands.
 * It creates the User record along with the associated profile (Creator or Brand).
 *
 * REQUEST BODY:
 * -------------
 * {
 *   name: string,              // User's display name
 *   email: string,             // Email address (must be unique)
 *   password: string,          // Plain text password (will be hashed)
 *   userType: 'creator' | 'brand',  // Account type
 *   companyName?: string       // Required for brand accounts only
 * }
 *
 * RESPONSE:
 * ---------
 * Success (201):
 * { message: 'User created successfully', userId: string }
 *
 * Error (400): Missing fields or validation failure
 * { error: 'Error message' }
 *
 * Error (500): Server error
 * { error: 'Internal server error' }
 *
 * SECURITY FEATURES:
 * ------------------
 * 1. Password Hashing: Passwords are hashed using bcrypt with 10 rounds
 * 2. Email Uniqueness: Prevents duplicate accounts
 * 3. Input Validation: All required fields are checked
 * 4. Error Handling: Prisma errors are caught and handled appropriately
 *
 * DATABASE OPERATIONS:
 * --------------------
 * Creates a User record with a nested Creator or Brand profile.
 * This is done in a single transaction to ensure consistency.
 *
 * For Creators:
 * - Creates User with userType: 'CREATOR'
 * - Creates linked Creator profile with empty niche array
 *
 * For Brands:
 * - Creates User with userType: 'BRAND'
 * - Creates linked Brand profile with companyName
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * POST handler for user registration
 *
 * Creates a new user account with the appropriate profile type.
 *
 * @param req - The incoming request with registration data
 * @returns JSON response with success message or error
 */
export async function POST(req: Request) {
  try {
    // =========================================================================
    // PARSE REQUEST BODY
    // =========================================================================
    const { name, email, password, userType, companyName } = await req.json();

    // =========================================================================
    // VALIDATE REQUIRED FIELDS
    // =========================================================================

    // Check for all required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Brand accounts require a company name
    if (userType === 'brand' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for brand accounts' },
        { status: 400 }
      );
    }

    // =========================================================================
    // CHECK FOR EXISTING USER
    // =========================================================================

    // Prevent duplicate accounts with the same email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // =========================================================================
    // HASH PASSWORD
    // =========================================================================

    /**
     * Hash the password using bcrypt with 10 salt rounds.
     *
     * Salt rounds determine the computational complexity:
     * - Higher = more secure but slower
     * - 10 rounds is a good balance for most applications
     * - Produces a 60-character hash string
     */
    const passwordHash = await bcrypt.hash(password, 10);

    // =========================================================================
    // CREATE USER WITH PROFILE
    // =========================================================================

    /**
     * Create the user with nested profile creation.
     *
     * Prisma handles this as a single transaction, so either both
     * the User and profile are created, or neither is.
     *
     * The spread operator conditionally adds either:
     * - creator: { create: {...} } for creator accounts
     * - brand: { create: {...} } for brand accounts
     */
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        userType: userType.toUpperCase(), // Convert to enum value ('CREATOR' or 'BRAND')

        // Conditionally create Creator profile
        ...(userType === 'creator' && {
          creator: {
            create: {
              niche: [], // Initialize with empty array - user can add later
            },
          },
        }),

        // Conditionally create Brand profile
        ...(userType === 'brand' && {
          brand: {
            create: {
              companyName, // Company name is required for brands
            },
          },
        }),
      },
    });

    // =========================================================================
    // RETURN SUCCESS RESPONSE
    // =========================================================================

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );

  } catch (error: any) {
    // =========================================================================
    // ERROR HANDLING
    // =========================================================================

    console.error('Signup error:', error);

    /**
     * Handle specific Prisma errors with user-friendly messages.
     *
     * Prisma error codes:
     * - P2002: Unique constraint violation (duplicate email)
     * - P2003: Foreign key constraint failure
     * - P1001: Can't reach database server
     * - P1002: Database server was reached but timed out
     */

    // Duplicate email error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Database relationship error
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Database relationship error. Please contact support.' },
        { status: 500 }
      );
    }

    // Database connection errors
    if (error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      );
    }

    // Generic error fallback
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
