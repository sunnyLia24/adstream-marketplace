import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic (not statically rendered at build time)
// Required because we use getServerSession() which needs request headers
export const dynamic = 'force-dynamic';

/**
 * GET /api/deals
 * Fetches deals for the authenticated user (either as a brand or creator)
 * Supports filtering by status: 'active', 'completed', or 'pending'
 */
export async function GET(req: Request) {
  try {
    // ============================================
    // STEP 1: Authentication Check
    // Verify the user is logged in via NextAuth session
    // ============================================
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================
    // STEP 2: Parse Query Parameters
    // Extract the optional 'status' filter from the URL
    // Example: /api/deals?status=active
    // ============================================
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active', 'completed', 'pending'

    // ============================================
    // STEP 3: Fetch User with Profile Data
    // Get the user from database along with their brand/creator profile
    // A user can be either a brand OR a creator (not both)
    // ============================================
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        brand: true,   // Include brand profile if user is a brand
        creator: true, // Include creator profile if user is a creator
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ============================================
    // STEP 4: Build Status Filter
    // Create a dynamic where clause based on the status parameter
    // ============================================
    let deals;
    const whereClause: any = {};

    if (status === 'active') {
      // Active deals: payment is pending or paid, but not yet verified
      whereClause.paymentStatus = { in: ['PENDING', 'PAID'] };
      whereClause.verificationStatus = 'PENDING';
    } else if (status === 'completed') {
      // Completed deals: fully verified and approved
      whereClause.verificationStatus = 'APPROVED';
    } else if (status === 'pending') {
      // Pending deals: awaiting payment
      whereClause.paymentStatus = 'PENDING';
    }

    // ============================================
    // STEP 5: Fetch Deals Based on User Type
    // Different queries for brands vs creators
    // ============================================
    if (user.brand) {
      // BRAND USER: Fetch deals where this brand is the advertiser
      deals = await prisma.deal.findMany({
        where: {
          brandId: user.brand.id,
          ...whereClause, // Apply status filters
        },
        include: {
          // Include creator info (who the brand is working with)
          creator: {
            include: {
              user: true, // Get creator's user details (name, email)
            },
          },
          // Include the original bid and content listing details
          bid: {
            include: {
              contentListing: true,
            },
          },
          adSlot: true, // Include ad slot details (type, pricing)
        },
        orderBy: { createdAt: 'desc' }, // Most recent deals first
      });
    } else if (user.creator) {
      // CREATOR USER: Fetch deals where this creator is the content provider
      deals = await prisma.deal.findMany({
        where: {
          creatorId: user.creator.id,
          ...whereClause, // Apply status filters
        },
        include: {
          // Include brand info (who the creator is working with)
          brand: {
            include: {
              user: true, // Get brand's user details (name, email)
            },
          },
          // Include the original bid and content listing details
          bid: {
            include: {
              contentListing: true,
            },
          },
          adSlot: true, // Include ad slot details (type, pricing)
        },
        orderBy: { createdAt: 'desc' }, // Most recent deals first
      });
    } else {
      // User has no brand or creator profile
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // ============================================
    // STEP 6: Return the Deals
    // Send the deals array as JSON response
    // ============================================
    return NextResponse.json(deals);
  } catch (error) {
    // Log error for debugging and return generic error message
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
