import { ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { NextResponse } from 'next/server';

import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

export async function POST(req: Request) {
  const { email, code, newPassword } = (await req.json()) as {
    email: string;
    code: string;
    newPassword: string;
  };

  try {
    await cognitoClient.send(
      new ConfirmForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      })
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errName = (err as { name?: string }).name;
    if (errName === 'CodeMismatchException' || errName === 'ExpiredCodeException') {
      return NextResponse.json(
        { error: 'Invalid or expired code.' },
        { status: 400 }
      );
    }
    if (errName === 'InvalidPasswordException') {
      const msg = (err as { message?: string }).message ?? 'Password does not meet requirements.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Reset failed.' }, { status: 500 });
  }
}
