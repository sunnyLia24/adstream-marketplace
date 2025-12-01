import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find the user with their creator profile
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

    // Disconnect YouTube by clearing the related fields
    await prisma.creator.update({
      where: { id: user.creator.id },
      data: {
        youtubeChannelId: null,
        youtubeToken: null,
        channelName: null,
        channelUrl: null,
        subscriberCount: null,
        profileImage: null,
      },
    });

    return NextResponse.json(
      { message: 'YouTube account disconnected successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('YouTube disconnect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

