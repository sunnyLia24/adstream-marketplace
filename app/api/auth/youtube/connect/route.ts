import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = await getServerSession();
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', baseUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: 'YouTube integration not configured. Please set up Google OAuth credentials.' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state in cookie for validation in callback
    const cookieStore = await cookies();
    cookieStore.set('youtube_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly';

    // Build OAuth URL with properly encoded parameters
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('YouTube connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

