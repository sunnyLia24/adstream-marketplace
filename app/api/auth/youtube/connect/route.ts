import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
      return NextResponse.redirect(`${baseUrl}/auth/signin`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXTAUTH_URL;

    // Validate all required configuration
    if (!clientId || !clientSecret || clientId === 'placeholder' || clientSecret === 'placeholder') {
      return NextResponse.json(
        {
          error: 'YouTube integration not configured. Please set up Google OAuth credentials.',
          details: 'Missing or invalid GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.'
        },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        {
          error: 'Application URL not configured.',
          details: 'Missing NEXTAUTH_URL environment variable.'
        },
        { status: 500 }
      );
    }

    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly';

    // Build OAuth URL with properly encoded parameters
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: unknown) {
    console.error('YouTube connect error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

