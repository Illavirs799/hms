import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();

  // Explicitly delete/expire the cookie
  cookieStore.set('session', '', {
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  return NextResponse.json({ success: true });
}
