import type { ApolloServerPlugin } from '@apollo/server';
import { logger } from '../lib/logger.js';

export function createOperationLoggerPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart() {
      const requestStart = Date.now();

      return {
        async didResolveOperation(ctx) {
          logger.debug('GraphQL operation resolved', {
            operationName: ctx.operationName ?? 'anonymous',
            operationType: ctx.operation?.operation,
          });
        },

        async didEncounterErrors(ctx) {
          const isClientError = ctx.errors?.every(
            (e) =>
              e.extensions?.code &&
              e.extensions.code !== 'INTERNAL_SERVER_ERROR'
          );

          const logMethod = isClientError ? 'warn' : 'error';
          logger[logMethod]('GraphQL operation errors', {
            operationName: ctx.operationName ?? 'anonymous',
            errorCount: ctx.errors?.length ?? 0,
            errors: ctx.errors?.map((e) => ({
              message: e.message,
              code: e.extensions?.code,
              path: e.path,
              locations: e.locations,
            })),
          });
        },

        async willSendResponse(ctx) {
          logger.info('GraphQL operation completed', {
            operationName: ctx.operationName ?? 'anonymous',
            operationType: ctx.operation?.operation,
            durationMs: Date.now() - requestStart,
            hasErrors: Boolean(ctx.errors?.length),
            errorCount: ctx.errors?.length ?? 0,
          });
        },
      };
    },

    async unexpectedErrorProcessingRequest({ error }) {
      logger.error('Unexpected error processing GraphQL request', { error });
    },
  };
}
