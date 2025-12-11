import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.redirect(`${baseUrl}/auth/signin`);
    }

    // Redirect to Google OAuth with YouTube scope
    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: 'YouTube integration not configured. Please set up Google OAuth credentials.' },
        { status: 500 }
      );
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('YouTube connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

