import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is brand or creator
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        brand: true,
        creator: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let bids;

    if (user.brand) {
      // Get bids placed by this brand
      bids = await prisma.bid.findMany({
        where: { brandId: user.brand.id },
        include: {
          contentListing: {
            include: {
              creator: {
                include: {
                  user: true,
                },
              },
            },
          },
          adSlot: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.creator) {
      // Get bids received by this creator
      bids = await prisma.bid.findMany({
        where: { creatorId: user.creator.id },
        include: {
          brand: {
            include: {
              user: true,
            },
          },
          contentListing: true,
          adSlot: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contentListingId, adSlotId, bidAmount, message } = body;

    // Validation
    if (!contentListingId || !adSlotId || !bidAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get brand profile
    const brand = await prisma.brand.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
    }

    // Get ad slot and content listing
    const adSlot = await prisma.adSlot.findUnique({
      where: { id: adSlotId },
      include: {
        contentListing: {
          include: {
            creator: true,
          },
        },
      },
    });

    if (!adSlot) {
      return NextResponse.json({ error: 'Ad slot not found' }, { status: 404 });
    }

    // Check if ad slot is available
    if (adSlot.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Ad slot is no longer available' },
        { status: 400 }
      );
    }

    // Check if bid amount meets reserve price
    if (parseFloat(bidAmount) < parseFloat(adSlot.reservePrice.toString())) {
      return NextResponse.json(
        { error: `Bid must be at least $${adSlot.reservePrice}` },
        { status: 400 }
      );
    }

    // Check bidding window (72 hours before publish date)
    const publishDate = new Date(adSlot.contentListing.plannedPublishDate);
    const now = new Date();
    const hoursUntilPublish = (publishDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilPublish < 72) {
      return NextResponse.json(
        { error: 'Bidding closed - less than 72 hours until publish date' },
        { status: 400 }
      );
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        brandId: brand.id,
        contentListingId,
        adSlotId,
        creatorId: adSlot.contentListing.creatorId,
        bidAmount: parseFloat(bidAmount),
        message,
        status: 'PENDING',
      },
      include: {
        brand: {
          include: {
            user: true,
          },
        },
        contentListing: true,
        adSlot: true,
      },
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
