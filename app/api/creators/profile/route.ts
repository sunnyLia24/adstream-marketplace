import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic (not statically rendered at build time)
// Required because we use getServerSession() which needs request headers
export const dynamic = 'force-dynamic';

/**
 * GET /api/creators/profile
 * Fetches the authenticated creator's full profile with stats
 * Returns profile data, content listings, deals, and calculated statistics
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
    // STEP 2: Fetch Creator Profile with Related Data
    // Get the creator profile linked to this user's email
    // Include all related data needed for the profile page
    // ============================================
    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
      include: {
        // Include basic user info (id, email, name)
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        // Include all content listings with their ad slots and bids
        contentListings: {
          include: {
            adSlots: true, // Available ad placement slots
            bids: true,    // Bids from brands on this content
          },
        },
        // Include all deals (accepted bids that became contracts)
        deals: {
          include: {
            bid: true,    // Original bid details
            adSlot: true, // Which ad slot was purchased
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // ============================================
    // STEP 3: Calculate Dashboard Statistics
    // Aggregate various metrics for the creator's dashboard
    // ============================================

    // Calculate total earnings from all paid deals
    const totalEarnings = await prisma.deal.aggregate({
      where: {
        creatorId: creator.id,
        paymentStatus: 'PAID', // Only count completed payments
      },
      _sum: {
        creatorPayout: true, // Sum up all creator payouts
      },
    });

    // Count bids awaiting creator's response
    const activeBids = await prisma.bid.count({
      where: {
        creatorId: creator.id,
        status: 'PENDING', // Bids not yet accepted/rejected
      },
    });

    // Count upcoming content (active listings with future publish dates)
    const upcomingContent = await prisma.contentListing.count({
      where: {
        creatorId: creator.id,
        status: 'ACTIVE',
        plannedPublishDate: {
          gte: new Date(), // Publish date is in the future
        },
      },
    });

    // Count successfully completed deals
    const completedDeals = await prisma.deal.count({
      where: {
        creatorId: creator.id,
        verificationStatus: 'APPROVED', // Deal was verified complete
      },
    });

    // ============================================
    // STEP 4: Return Profile with Stats
    // Combine creator data with calculated statistics
    // ============================================
    return NextResponse.json({
      ...creator, // Spread all creator profile data
      stats: {
        totalEarnings: totalEarnings._sum.creatorPayout || 0,
        activeBids,
        upcomingContent,
        completedDeals,
      },
    });
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/creators/profile
 * Updates the authenticated creator's profile information
 * Accepts: bio, niche, channelName, channelUrl
 */
export async function PUT(req: Request) {
  try {
    // ============================================
    // STEP 1: Authentication Check
    // Verify the user is logged in
    // ============================================
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================
    // STEP 2: Parse Request Body
    // Extract the fields to update from the request
    // ============================================
    const body = await req.json();
    const { bio, niche, channelName, channelUrl } = body;

    // ============================================
    // STEP 3: Find Creator Profile
    // Verify the user has a creator profile to update
    // ============================================
    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // ============================================
    // STEP 4: Update Creator Profile
    // Apply the changes to the database
    // ============================================
    const updatedCreator = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        bio,         // Creator's biography/description
        niche,       // Content category (e.g., "tech", "gaming", "lifestyle")
        channelName, // YouTube/social channel name
        channelUrl,  // Link to their channel
      },
    });

    // ============================================
    // STEP 5: Return Updated Profile
    // Send back the updated creator data
    // ============================================
    return NextResponse.json(updatedCreator);
  } catch (error) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
