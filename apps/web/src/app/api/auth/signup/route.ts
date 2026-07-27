import { SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { NextResponse } from 'next/server';

import { COGNITO_CLIENT_ID, cognitoClient } from '@/lib/auth/cognito';

export async function POST(req: Request) {
  const { email, password, name } = (await req.json()) as {
    email: string;
    password: string;
    name: string;
  };

  try {
    await cognitoClient.send(
      new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
        ],
      })
    );

    return NextResponse.json({ requiresConfirmation: true }, { status: 201 });
  } catch (err: unknown) {
    const errName = (err as { name?: string }).name;
    const message = (err as { message?: string }).message ?? '';
    if (errName === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    if (errName === 'InvalidPasswordException') {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Sign up failed.' }, { status: 500 });
  }
}
