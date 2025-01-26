'use server';

import prisma from '@/lib/db';
import * as jose from 'jose';

const secretKey = new TextEncoder().encode(
  process.env.SECRET_KEY || 'your-secret-key'
);

export async function validateSession(accessToken: string) {
  console.log('Starting validateSession function');

  try {
    if (!accessToken) {
      console.log('No access token provided.');
      return { valid: false, refreshRequired: true };
    }

    console.log('Access token provided. Verifying access token.');

    // Verify and decode the access token
    const { payload } = await jose.jwtVerify(accessToken, secretKey);

    const {
      session: { sessionId, userType },
    } = payload as { session: { sessionId: string; userType: string } };

    console.log(
      'Access token verified. Fetching session with sessionId:',
      sessionId
    );

    // Fetch the session from the database
    const session = await prisma.session.findUnique({
      where: { token: sessionId },
    });

    if (!session) {
      console.log('Session not found with sessionId from access token.');
      throw new Error('Session not found');
    }

    // Check if the session has expired
    if (new Date(session.expiresAt) < new Date()) {
      console.log('Session expired. Cannot proceed.');
      throw new Error('Session expired');
    }

    console.log('Session is valid. Returning session data.');

    return {
      valid: true,
      userType: session.userType,
      userId: session.userId,
      session,
    };
  } catch (error) {
    console.error('Error validating session:', (error as Error).message);
    return {
      valid: false,
      refreshRequired: (error as Error).message === 'Session expired',
    };
  }
}
