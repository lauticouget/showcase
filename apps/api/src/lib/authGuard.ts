import { GraphQLError } from 'graphql';

import type { CognitoAccessTokenPayload } from './cognito.js';
import { GraphQLErrorCode } from './errors.js';

export interface AppContext {
  currentUser: CognitoAccessTokenPayload | null;
}

/** Throws UNAUTHENTICATED if no valid session. */
export function requireAuth(context: AppContext): CognitoAccessTokenPayload {
  if (!context.currentUser) {
    throw new GraphQLError('Not authenticated', {
      extensions: { code: GraphQLErrorCode.Unauthenticated },
    });
  }
  return context.currentUser;
}

/** Throws FORBIDDEN if the authenticated user is not the resource owner. */
export function requireOwnership(
  context: AppContext,
  targetUserId: string
): CognitoAccessTokenPayload {
  const user = requireAuth(context);
  if (user.sub !== targetUserId) {
    throw new GraphQLError('Access denied', {
      extensions: { code: GraphQLErrorCode.Forbidden },
    });
  }
  return user;
}
