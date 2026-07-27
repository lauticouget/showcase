import { ApolloServer } from '@apollo/server';
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  Context,
} from 'aws-lambda';

import type { CognitoAccessTokenPayload } from './lib/cognito.js';
import { verifyAccessToken } from './lib/cognito.js';
import { logger } from './lib/logger.js';
import { createOperationLoggerPlugin } from './plugins/operationLogger.js';
import { schema } from './schema';

export interface AppContext {
  lambdaContext: Context;
  currentUser: CognitoAccessTokenPayload | null;
}

const server = new ApolloServer<AppContext>({
  schema,
  plugins: [createOperationLoggerPlugin()],
});

function extractBearerToken(
  event: APIGatewayProxyEventV2
): string | undefined {
  const auth = event.headers['authorization'] ?? event.headers['Authorization'];
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}

export const handler: APIGatewayProxyHandlerV2 =
  startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventV2RequestHandler(),
    {
      context: async ({ event, context }) => {
        logger.addContext(context);
        logger.info('Lambda invocation started', {
          remainingTimeMs: context.getRemainingTimeInMillis(),
        });
        const token = extractBearerToken(event);
        const currentUser = await verifyAccessToken(token);
        return { lambdaContext: context, currentUser };
      },
    }
  );
