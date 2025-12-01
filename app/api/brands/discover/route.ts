import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listings = await prisma.contentListing.findMany({
      where: {
        status: 'ACTIVE',
        plannedPublishDate: {
          gte: new Date(),
        },
      },
      include: {
        creator: {
          include: {
            user: true,
          },
        },
        adSlots: {
          where: {
            status: 'AVAILABLE',
          },
        },
      },
    });

    const formatted = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      topic: listing.topic,
      description: listing.description,
      plannedDate: listing.plannedPublishDate,
      creator: {
        id: listing.creator.id,
        name: listing.creator.user.name,
      },
      adSlots: listing.adSlots.map((slot) => ({
        id: slot.id,
        type: slot.slotType,
        reservePrice: slot.reservePrice,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
