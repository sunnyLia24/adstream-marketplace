import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
      include: {
        creator: true,
      },
    });

    if (!user || !user.creator) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      );
    }

    // Return profile data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      creator: {
        id: user.creator.id,
        bio: user.creator.bio,
        niche: user.creator.niche,
        youtubeChannelId: user.creator.youtubeChannelId,
        channelName: user.creator.channelName,
        channelUrl: user.creator.channelUrl,
        subscriberCount: user.creator.subscriberCount,
        profileImage: user.creator.profileImage,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, bio, niche } = await req.json();

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

    // Update user name
    if (name && name !== user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Update creator profile
    await prisma.creator.update({
      where: { id: user.creator.id },
      data: {
        bio: bio || null,
        niche: niche || [],
      },
    });

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

