import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const niches = searchParams.get('niches')?.split(',').filter(Boolean) || [];
    const minAudienceSize = parseInt(searchParams.get('minAudienceSize') || '0');
    const minEngagement = parseFloat(searchParams.get('minEngagement') || '0');
    const topic = searchParams.get('topic') || '';

    // Build where clause
    const where: any = {
      status: 'ACTIVE',
      plannedPublishDate: {
        gte: new Date(),
      },
      adSlots: {
        some: {
          status: 'AVAILABLE',
        },
      },
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add topic filter
    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' };
    }

    // Add niche filter (from creator)
    if (niches.length > 0) {
      where.creator = {
        niche: {
          hasSome: niches,
        },
      };
    }

    // Add audience size filter
    if (minAudienceSize > 0) {
      where.creator = {
        ...where.creator,
        subscriberCount: {
          gte: minAudienceSize,
        },
      };
    }

    // Add engagement filter
    if (minEngagement > 0) {
      where.avgEngagementRate = {
        gte: minEngagement,
      };
    }

    // Fetch listings with creator info and available ad slots
    const listings = await prisma.contentListing.findMany({
      where,
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        adSlots: {
          where: {
            status: 'AVAILABLE',
          },
        },
        bids: {
          where: {
            status: 'PENDING',
          },
        },
      },
      orderBy: {
        plannedPublishDate: 'asc',
      },
      take: 50, // Limit results
    });

    // Format response
    const formattedListings = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      topic: listing.topic,
      description: listing.description,
      seriesName: listing.seriesName,
      plannedDate: listing.plannedPublishDate,
      expectedViews: listing.expectedViews,
      avgEngagementRate: listing.avgEngagementRate,
      demographics: listing.audienceDemographics,
      creator: {
        id: listing.creator.id,
        name: listing.creator.user.name,
        channelName: listing.creator.channelName,
        subscribers: listing.creator.subscriberCount,
        profileImage: listing.creator.profileImage,
        niche: listing.creator.niche,
      },
      adSlots: listing.adSlots.map((slot) => ({
        id: slot.id,
        type: slot.slotType,
        reservePrice: slot.reservePrice,
        duration: slot.duration,
        position: slot.position,
      })),
      activeBids: listing.bids.length,
    }));

    return NextResponse.json(formattedListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
