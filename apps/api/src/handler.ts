import { ApolloServer } from '@apollo/server';
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import type { Context, APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { schema } from './schema';
import { logger } from './lib/logger.js';
import { createOperationLoggerPlugin } from './plugins/operationLogger.js';

export interface AppContext {
  lambdaContext: Context;
}

const server = new ApolloServer<AppContext>({
  schema,
  plugins: [createOperationLoggerPlugin()],
});

export const handler: APIGatewayProxyHandlerV2 =
  startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventV2RequestHandler(),
    {
      context: async ({ context }) => {
        // Injects awsRequestId, functionName, functionVersion,
        // functionMemorySize, coldStart into every subsequent log line.
        logger.addContext(context);
        logger.info('Lambda invocation started', {
          remainingTimeMs: context.getRemainingTimeInMillis(),
        });
        return { lambdaContext: context };
      },
    }
  );
