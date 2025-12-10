import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealId = params.id;
    const body = await req.json();
    const { contentUrl } = body;

    if (!contentUrl) {
      return NextResponse.json(
        { error: 'Content URL is required' },
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

    // Get deal
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        bid: {
          include: {
            contentListing: true,
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify deal belongs to this creator
    if (deal.creatorId !== creator.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if content already delivered
    if (deal.contentDelivered) {
      return NextResponse.json(
        { error: 'Content has already been submitted for this deal' },
        { status: 400 }
      );
    }

    // Check if deal is in valid state
    if (deal.verificationStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Deal is not in a valid state for content submission' },
        { status: 400 }
      );
    }

    // Update deal with content URL
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        contentUrl,
        contentDelivered: true,
      },
      include: {
        brand: {
          include: {
            user: true,
          },
        },
        bid: {
          include: {
            contentListing: true,
          },
        },
        adSlot: true,
      },
    });

    return NextResponse.json(updatedDeal, { status: 200 });
  } catch (error) {
    console.error('Error submitting content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
