import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Extracts and verifies the user ID from the JWT token in cookies or Authorization header.
 */
export async function getUserFromToken(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    if (!decoded || !decoded.userId) return null;

    return decoded.userId;
  } catch {
    // Specifically handle expired tokens vs malformed ones if needed
    return null;
  }
}

/**
 * Standard error response helper for API consistency and security.
 */
export function apiError(message: string, status: number = 500) {
  return Response.json({ error: message }, { status });
}
