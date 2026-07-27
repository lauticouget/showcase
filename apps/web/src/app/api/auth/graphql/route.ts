import { InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from '@/lib/auth/cookies';
import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

const LAMBDA_URL = process.env['GRAPHQL_LAMBDA_URL'] ?? '';

async function forwardToLambda(
  body: string,
  accessToken: string | undefined
): Promise<Response> {
  return fetch(LAMBDA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body,
  });
}

async function tryRefresh(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<string | null> {
  const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;
  if (!refreshToken) return null;
  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      })
    );
    const newToken = result.AuthenticationResult?.AccessToken;
    if (!newToken) return null;
    cookieStore.set(COOKIE_ACCESS_TOKEN, newToken, ACCESS_TOKEN_COOKIE);
    return newToken;
  } catch {
    return null;
  }
}

function hasUnauthenticatedError(json: unknown): boolean {
  const errors = (
    json as { errors?: { extensions?: { code?: string } }[] }
  )?.errors;
  return !!errors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
}

export async function POST(req: Request) {
  const body = await req.text();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;

  let lambdaRes = await forwardToLambda(body, accessToken);
  const json = await lambdaRes.json();

  // If UNAUTHENTICATED, attempt token refresh once and retry
  if (hasUnauthenticatedError(json) && accessToken) {
    const refreshed = await tryRefresh(cookieStore);
    if (refreshed) {
      lambdaRes = await forwardToLambda(body, refreshed);
      return NextResponse.json(await lambdaRes.json());
    }
  }

  return NextResponse.json(json);
}
