import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, topic, seriesName, plannedPublishDate, description, adSlots } = await req.json();

    // Validate required fields
    if (!title || !topic || !plannedPublishDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title, topic, and plannedPublishDate are required' },
        { status: 400 }
      );
    }

    // Validate ad slots
    if (!adSlots || adSlots.length === 0) {
      return NextResponse.json(
        { error: 'At least one ad slot is required' },
        { status: 400 }
      );
    }

    // Find the user and their creator profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creator: true },
    });

    if (!user || !user.creator) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Validate plannedPublishDate is in the future
    const publishDate = new Date(plannedPublishDate);
    if (publishDate < new Date()) {
      return NextResponse.json(
        { error: 'Planned publish date must be in the future' },
        { status: 400 }
      );
    }

    // Create the content listing with ad slots
    const contentListing = await prisma.contentListing.create({
      data: {
        creatorId: user.creator.id,
        title,
        topic,
        seriesName: seriesName || null,
        description: description || null,
        plannedPublishDate: publishDate,
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

    return NextResponse.json(
      { 
        message: 'Content listing created successfully',
        listing: contentListing 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create listing error:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A listing with this title already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid creator reference' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user and their creator profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creator: true },
    });

    if (!user || !user.creator) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Get all listings for this creator
    const listings = await prisma.contentListing.findMany({
      where: {
        creatorId: user.creator.id,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ listings }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

