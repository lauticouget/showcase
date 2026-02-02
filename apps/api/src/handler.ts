import { ApolloServer } from '@apollo/server';
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from '@as-integrations/aws-lambda';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { schema } from './schema';

const server = new ApolloServer({
  schema,
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  // Add your Amplify domain here once deployed, e.g.:
  // 'https://main.abc123.amplifyapp.com',
  // 'https://yourdomain.com',
];

function getCorsHeaders(origin: string | undefined) {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    middleware: [
      async (event) => {
        const origin = event.headers?.origin;
        const corsHeaders = getCorsHeaders(origin);

        // Handle preflight OPTIONS request
        if (event.requestContext.http.method === 'OPTIONS') {
          return {
            statusCode: 204,
            headers: corsHeaders,
            body: '',
          };
        }

        // Return a function to add CORS headers to the response
        return async (result: APIGatewayProxyStructuredResultV2) => {
          result.headers = { ...result.headers, ...corsHeaders };
        };
      },
    ],
  }
);
