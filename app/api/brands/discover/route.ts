import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic (not statically rendered at build time)
// Required because we use getServerSession() which needs request headers
export const dynamic = 'force-dynamic';

/**
 * GET /api/brands/discover
 * Returns a list of active content listings for brands to discover and bid on
 * Only shows listings with future publish dates and available ad slots
 */
export async function GET(req: Request) {
  try {
    // ============================================
    // STEP 1: Authentication Check
    // Verify the user is logged in (typically a brand user)
    // ============================================
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================
    // STEP 2: Fetch Active Content Listings
    // Query for listings that brands can bid on:
    // - Status must be ACTIVE (not draft or closed)
    // - Publish date must be in the future
    // ============================================
    const listings = await prisma.contentListing.findMany({
      where: {
        status: 'ACTIVE',
        plannedPublishDate: {
          gte: new Date(), // Only show upcoming content
        },
      },
      include: {
        // Include creator info to show who's making the content
        creator: {
          include: {
            user: true, // Get creator's name and details
          },
        },
        // Only include ad slots that are still available for bidding
        adSlots: {
          where: {
            status: 'AVAILABLE', // Filter out already-sold slots
          },
        },
      },
    });

    // ============================================
    // STEP 3: Format Response Data
    // Transform the raw database data into a cleaner format
    // Only include fields needed by the frontend
    // ============================================
    const formatted = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,           // Content title (e.g., "Tech Review Video")
      topic: listing.topic,           // Content topic/category
      description: listing.description, // Detailed description
      plannedDate: listing.plannedPublishDate, // When content will be published

      // Creator info (simplified)
      creator: {
        id: listing.creator.id,
        name: listing.creator.user.name, // Creator's display name
      },

      // Available ad slots for this content
      adSlots: listing.adSlots.map((slot) => ({
        id: slot.id,
        type: slot.slotType,         // Type of ad placement (e.g., "pre-roll", "mid-roll")
        reservePrice: slot.reservePrice, // Minimum bid amount
      })),
    }));

    // ============================================
    // STEP 4: Return Formatted Listings
    // Send the discovery feed to the brand
    // ============================================
    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
