import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all active listings with available ad slots
    const listings = await prisma.contentListing.findMany({
      where: {
        status: 'ACTIVE',
        plannedPublishDate: {
          gte: new Date(),
        },
        adSlots: {
          some: {
            status: 'AVAILABLE',
          },
        },
      },
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
      creator: {
        id: listing.creator.id,
        name: listing.creator.user.name,
        channelName: listing.creator.channelName,
        subscribers: listing.creator.subscriberCount,
        profileImage: listing.creator.profileImage,
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
