import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken, ensureDefaultUsers } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    ensureDefaultUsers();

    // Check cookie or Authorization header
    let token = req.cookies.get('opsguard_session')?.value;
    if (!token) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const session = getSessionFromToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = db.getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err: any) {
    console.error('Auth verification error:', err);
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
