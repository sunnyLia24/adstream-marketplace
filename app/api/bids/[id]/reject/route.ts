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

    const bidId = params.id;
    const body = await req.json();
    const { reason } = body; // Optional rejection reason

    // Get creator profile
    if (!session.user?.email) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const creator = await prisma.creator.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Get bid
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        brand: {
          include: {
            user: true,
          },
        },
        contentListing: true,
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

    // Update bid status to REJECTED
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { 
        status: 'REJECTED',
        message: reason ? `Rejected: ${reason}` : bid.message,
      },
    });

    return NextResponse.json(updatedBid, { status: 200 });
  } catch (error) {
    console.error('Error rejecting bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
