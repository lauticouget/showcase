import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from '@/lib/auth/cookies';
import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      })
    );

    const accessToken = result.AuthenticationResult?.AccessToken;
    if (!accessToken) {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
    }

    cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }
}
