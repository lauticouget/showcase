import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env['COGNITO_USER_POOL_ID'] ?? '';
const clientId = process.env['COGNITO_CLIENT_ID'] ?? '';

// Singleton — JWKS is cached in memory across warm invocations
const verifier = CognitoJwtVerifier.create({
  userPoolId,
  clientId,
  tokenUse: 'access',
});

export interface CognitoAccessTokenPayload {
  sub: string; // = userId in DynamoDB
  username: string;
  token_use: 'access';
}

/** Returns null on any verification failure — never throws. */
export async function verifyAccessToken(
  token: string | undefined
): Promise<CognitoAccessTokenPayload | null> {
  if (!token || !userPoolId || !clientId) return null;
  try {
    const payload = await verifier.verify(token);
    return payload as unknown as CognitoAccessTokenPayload;
  } catch {
    return null;
  }
}
