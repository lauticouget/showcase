import { ApolloServer } from '@apollo/server';
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { schema } from './schema';

const server = new ApolloServer({
  schema,
});

export const handler: APIGatewayProxyHandlerV2 =
  startServerAndCreateLambdaHandler(
    server,
    handlers.createAPIGatewayProxyEventV2RequestHandler()
  );
