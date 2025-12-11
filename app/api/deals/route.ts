import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active', 'completed', 'pending'

    // Get user and their profile
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

    let deals;
    const whereClause: any = {};

    // Add status filter
    if (status === 'active') {
      whereClause.paymentStatus = { in: ['PENDING', 'PAID'] };
      whereClause.verificationStatus = 'PENDING';
    } else if (status === 'completed') {
      whereClause.verificationStatus = 'APPROVED';
    } else if (status === 'pending') {
      whereClause.paymentStatus = 'PENDING';
    }

    if (user.brand) {
      // Get deals for this brand
      deals = await prisma.deal.findMany({
        where: {
          brandId: user.brand.id,
          ...whereClause,
        },
        include: {
          creator: {
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.creator) {
      // Get deals for this creator
      deals = await prisma.deal.findMany({
        where: {
          creatorId: user.creator.id,
          ...whereClause,
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
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
