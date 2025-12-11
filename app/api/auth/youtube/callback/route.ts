import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', baseUrl));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors from Google
    if (error) {
      console.error('YouTube OAuth error from Google:', error);
      return NextResponse.redirect(new URL(`/creator/profile?error=${error}`, baseUrl));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/creator/profile?error=no_code', baseUrl));
    }

    // Validate state parameter for CSRF protection
    const cookieStore = await cookies();
    const storedState = cookieStore.get('youtube_oauth_state')?.value;

    if (!state || !storedState || state !== storedState) {
      console.error('YouTube OAuth state mismatch');
      return NextResponse.redirect(new URL('/creator/profile?error=invalid_state', baseUrl));
    }

    // Clear the state cookie
    cookieStore.delete('youtube_oauth_state');

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${baseUrl}/api/auth/youtube/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get YouTube channel info
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    const channelResponse = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];

    if (!channel) {
      return NextResponse.redirect(new URL('/creator/profile?error=no_channel', baseUrl));
    }

    // Find the user with their creator profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creator: true },
    });

    if (!user || !user.creator) {
      return NextResponse.redirect(new URL('/creator/profile?error=no_profile', baseUrl));
    }

    // Update creator profile with YouTube data
    await prisma.creator.update({
      where: { id: user.creator.id },
      data: {
        youtubeChannelId: channel.id || null,
        youtubeToken: JSON.stringify(tokens),
        channelName: channel.snippet?.title || null,
        channelUrl: `https://youtube.com/channel/${channel.id}`,
        subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
        profileImage: channel.snippet?.thumbnails?.default?.url || null,
      },
    });

    return NextResponse.redirect(new URL('/creator/profile?success=youtube_connected', baseUrl));
  } catch (error: any) {
    console.error('YouTube callback error:', error);
    return NextResponse.redirect(new URL('/creator/profile?error=callback_failed', baseUrl));
  }
}

