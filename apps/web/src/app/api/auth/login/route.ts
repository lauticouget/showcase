import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  REFRESH_TOKEN_COOKIE,
} from '@/lib/auth/cookies';
import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as {
    email: string;
    password: string;
  };

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      })
    );

    const accessToken = result.AuthenticationResult?.AccessToken;
    const refreshToken = result.AuthenticationResult?.RefreshToken;

    if (!accessToken) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, ACCESS_TOKEN_COOKIE);
    if (refreshToken) {
      cookieStore.set(COOKIE_REFRESH_TOKEN, refreshToken, REFRESH_TOKEN_COOKIE);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const name = (err as { name?: string }).name;
    if (name === 'NotAuthorizedException' || name === 'UserNotFoundException') {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }
    if (name === 'UserNotConfirmedException') {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
