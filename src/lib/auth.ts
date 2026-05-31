import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-habit-tracker-key';
const COOKIE_NAME = 'habit_auth_token';

export interface JWTPayload {
  userId: string;
  phoneNumber: string;
}

/**
 * Generate a JWT token for the user session
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Set the auth cookie in the client response
 */
export async function setAuthCookie(payload: JWTPayload) {
  const token = generateToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

/**
 * Clear the auth cookie to log out the user
 */
export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verify token and return user details from a NextRequest
 */
export function getVerifiedTokenData(request: NextRequest): JWTPayload | null {
  // 1. Check cookies first
  const cookie = request.cookies.get(COOKIE_NAME);
  let token = cookie?.value;

  // 2. Fallback to Authorization Header
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification error:', error);
    return null;
  }
}

/**
 * Verify token and return user details from server context (headers/cookies)
 */
export async function getServerUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}
