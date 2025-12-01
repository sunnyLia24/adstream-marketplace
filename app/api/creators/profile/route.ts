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

    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        contentListings: {
          include: {
            adSlots: true,
            bids: true,
          },
        },
        deals: {
          include: {
            bid: true,
            adSlot: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Calculate stats
    const totalEarnings = await prisma.deal.aggregate({
      where: {
        creatorId: creator.id,
        paymentStatus: 'PAID',
      },
      _sum: {
        creatorPayout: true,
      },
    });

    const activeBids = await prisma.bid.count({
      where: {
        creatorId: creator.id,
        status: 'PENDING',
      },
    });

    const upcomingContent = await prisma.contentListing.count({
      where: {
        creatorId: creator.id,
        status: 'ACTIVE',
        plannedPublishDate: {
          gte: new Date(),
        },
      },
    });

    const completedDeals = await prisma.deal.count({
      where: {
        creatorId: creator.id,
        verificationStatus: 'APPROVED',
      },
    });

    return NextResponse.json({
      ...creator,
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

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bio, niche, channelName, channelUrl } = body;

    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    const updatedCreator = await prisma.creator.update({
      where: { id: creator.id },
      data: {
        bio,
        niche,
        channelName,
        channelUrl,
      },
    });

    return NextResponse.json(updatedCreator);
  } catch (error) {
    console.error('Error updating creator profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
