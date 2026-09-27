import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let token = req.cookies.get('opsguard_session')?.value;
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      invalidateSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('opsguard_session');
    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Internal server error during logout' }, { status: 500 });
  }
}
