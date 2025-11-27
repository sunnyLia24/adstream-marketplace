import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bidId = params.id;
    const body = await req.json();
    const { paymentTiming } = body; // 'UPFRONT' or 'AFTER_DELIVERY'

    // Get creator profile
    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Get bid with related data
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        adSlot: true,
        contentListing: true,
        brand: true,
      },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Verify bid belongs to this creator
    if (bid.creatorId !== creator.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if bid is still pending
    if (bid.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bid is no longer pending' },
        { status: 400 }
      );
    }

    // Check if ad slot is still available
    if (bid.adSlot.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Ad slot is no longer available' },
        { status: 400 }
      );
    }

    // Calculate fees
    const bidAmount = parseFloat(bid.bidAmount.toString());
    const platformFee = bidAmount * 0.20; // 20% platform fee
    const creatorPayout = bidAmount * 0.80; // 80% to creator

    // Create transaction: accept bid and create deal
    const result = await prisma.$transaction(async (tx) => {
      // Update bid status to ACCEPTED
      const updatedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      // Reject all other pending bids for this ad slot
      await tx.bid.updateMany({
        where: {
          adSlotId: bid.adSlotId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'OUTBID' },
      });

      // Update ad slot status to SOLD
      await tx.adSlot.update({
        where: { id: bid.adSlotId },
        data: { status: 'SOLD' },
      });

      // Create deal
      const deal = await tx.deal.create({
        data: {
          bidId: updatedBid.id,
          adSlotId: bid.adSlotId,
          creatorId: creator.id,
          brandId: bid.brandId,
          dealAmount: bidAmount,
          platformFee,
          creatorPayout,
          paymentTiming: paymentTiming || 'AFTER_DELIVERY',
          paymentStatus: 'PENDING',
          verificationStatus: 'PENDING',
        },
        include: {
          bid: true,
          adSlot: true,
          brand: {
            include: {
              user: true,
            },
          },
        },
      });

      return { bid: updatedBid, deal };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error accepting bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
