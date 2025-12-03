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

    // Get creator profile
    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Get all content listings for this creator
    const listings = await prisma.contentListing.findMany({
      where: { creatorId: creator.id },
      include: {
        adSlots: true,
        bids: {
          include: {
            brand: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching content listings:', error);
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
    const { title, topic, seriesName, plannedPublishDate, description, adSlots } = body;

    // Validation
    if (!title || !topic || !plannedPublishDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if publish date is in the future
    const publishDate = new Date(plannedPublishDate);
    if (publishDate < new Date()) {
      return NextResponse.json(
        { error: 'Publish date must be in the future' },
        { status: 400 }
      );
    }

    // Get creator profile
    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Create content listing with ad slots
    const contentListing = await prisma.contentListing.create({
      data: {
        creatorId: creator.id,
        title,
        topic,
        seriesName,
        plannedPublishDate: publishDate,
        description,
        status: 'ACTIVE',
        adSlots: {
          create: adSlots.map((slot: any) => ({
            slotType: slot.slotType,
            reservePrice: parseFloat(slot.reservePrice),
            duration: slot.duration ? parseInt(slot.duration) : null,
            position: slot.position || null,
            status: 'AVAILABLE',
          })),
        },
      },
      include: {
        adSlots: true,
      },
    });

    return NextResponse.json(contentListing, { status: 201 });
  } catch (error) {
    console.error('Error creating content listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
