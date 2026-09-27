import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSessionForUser, ensureDefaultUsers } from '@/lib/auth';
import { User } from '@/lib/types';
import { serialize } from 'v8';

export async function POST(req: NextRequest) {
  try {
    ensureDefaultUsers();
    const body = await req.json();
    const { email, password, name, role = 'developer' } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(trimmedEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const validRoles = ['admin', 'operator', 'developer', 'security'];
    const assignedRole = validRoles.includes(role) ? role : 'developer';

    const { hash, salt } = hashPassword(password);
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      name: (name && typeof name === 'string' && name.trim()) || trimmedEmail.split('@')[0],
      role: assignedRole as any,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.saveUser(newUser);
    const session = createSessionForUser(newUser);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token: session.token,
    }, { status: 201 });

    // Set HTTP-only cookie
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
    response.cookies.set('opsguard_session', session.token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error during registration: ' + err.message }, { status: 500 });
  }
}
