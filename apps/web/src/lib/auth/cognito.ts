import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env['COGNITO_REGION'] ?? 'us-east-1',
});

export const COGNITO_CLIENT_ID =
  process.env['NEXT_PUBLIC_COGNITO_CLIENT_ID'] ?? '';
