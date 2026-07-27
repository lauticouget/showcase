import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { NextResponse } from 'next/server';

import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

export async function POST(req: Request) {
  const { email } = (await req.json()) as { email: string };

  try {
    await cognitoClient.send(
      new ForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
      })
    );
  } catch {
    // Intentionally silent — never confirm whether email exists
  }

  // Always 200 to prevent email enumeration
  return NextResponse.json({ ok: true });
}
