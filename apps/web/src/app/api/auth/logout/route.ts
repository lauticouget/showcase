import { GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from '@/lib/auth/cookies';
import { cognitoClient } from '@/lib/auth/cognito';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  if (accessToken) {
    try {
      await cognitoClient.send(
        new GlobalSignOutCommand({ AccessToken: accessToken })
      );
    } catch {
      // Token may already be expired — still clear cookies
    }
  }

  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);

  return NextResponse.json({ ok: true });
}
