import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const COOKIE_ACCESS_TOKEN = 'access_token';
export const COOKIE_REFRESH_TOKEN = 'refresh_token';

const IS_PROD = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_COOKIE: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60, // 60 minutes — matches Cognito AccessTokenValidity
};

export const REFRESH_TOKEN_COOKIE: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict',
  path: '/api/auth/refresh', // scoped — only sent on token refresh requests
  maxAge: 30 * 24 * 60 * 60, // 30 days — matches Cognito RefreshTokenValidity
};
