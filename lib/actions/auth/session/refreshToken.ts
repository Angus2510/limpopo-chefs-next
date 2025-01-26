'use server';

import prisma from '@/lib/db';
import * as jose from 'jose';
import { fetchUserRoles } from '@/lib/actions/auth/roles/fetchRoles';

const secretKey = new TextEncoder().encode(
  process.env.SECRET_KEY || 'your-secret-key'
);
const ACCESS_TOKEN_EXPIRY = '1m';

async function generateAccessToken(
  sessionId: string,
  userType: string
): Promise<string> {
  return new jose.SignJWT({ session: { sessionId, userType } })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secretKey);
}

export async function refreshAccessToken(refreshToken: string) {
  console.log('Starting refreshAccessToken server action');

  if (!refreshToken) {
    console.log('No refresh token provided.');
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { payload } = await jose.jwtVerify(refreshToken, secretKey);
    const sessionId = payload.sessionId as string;

    console.log('Refresh token verified. Session ID:', sessionId);

    const session = await prisma.session.findUnique({
      where: { token: sessionId },
    });

    if (!session) {
      console.log('Session not found.');
      return { success: false, error: 'Session not found' };
    }

    const userRolesPermissions = await fetchUserRoles(
      session.userId,
      session.userType
    );

    const newAccessToken = await generateAccessToken(
      sessionId,
      session.userType
    );

    console.log('New access token generated:', newAccessToken);

    // Update session expiry
    session.expiresAt = new Date(Date.now() + 1 * 60 * 1000); // Extend session by 1 minute
    await prisma.session.update({
      where: { token: sessionId },
      data: {
        expiresAt: session.expiresAt,
        roles: userRolesPermissions.roles, // Update roles
        permissions: userRolesPermissions.permissions, // Update permissions
      },
    });

    console.log('Session expiry updated.');

    return { success: true, newAccessToken };
  } catch (error) {
    console.error('Failed to refresh access token:', (error as Error).message);
    return { success: false, error: (error as Error).message };
  }
}
