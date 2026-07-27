import { GraphQLError } from 'graphql';

import type { AppContext } from '../../handler.js';
import { requireOwnership } from '../../lib/authGuard.js';
import { DynamoErrorName, GraphQLErrorCode } from '../../lib/errors.js';
import * as repo from './userRepository.js';
import type { UserRecord } from './userRepository.js';

export const resolvers = {
  Query: {
    me: async (
      _: unknown,
      __: unknown,
      context: AppContext
    ): Promise<UserRecord | null> => {
      if (!context.currentUser) return null;
      return (await repo.getUser({ userId: context.currentUser.sub })) ?? null;
    },

    getUser: async (
      _: unknown,
      { userId }: { userId: string }
    ): Promise<UserRecord> => {
      const user = await repo.getUser({ userId });
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: GraphQLErrorCode.NotFound },
        });
      }
      return user;
    },

    listUsers: async (
      _: unknown,
      { limit, cursor }: { limit?: number; cursor?: string }
    ) => {
      return repo.listUsers(limit, cursor);
    },
  },

  Mutation: {
    updateUser: async (
      _: unknown,
      { userId, input }: { userId: string; input: { name?: string } },
      context: AppContext
    ): Promise<UserRecord> => {
      requireOwnership(context, userId);
      try {
        const updated = await repo.updateUser(userId, input);
        if (!updated) {
          throw new GraphQLError('User not found', {
            extensions: { code: GraphQLErrorCode.NotFound },
          });
        }
        return updated;
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name === DynamoErrorName.ConditionalCheckFailed
        ) {
          throw new GraphQLError('User not found', {
            extensions: { code: GraphQLErrorCode.NotFound },
          });
        }
        throw err;
      }
    },

    deleteUser: async (
      _: unknown,
      { userId }: { userId: string },
      context: AppContext
    ): Promise<boolean> => {
      requireOwnership(context, userId);
      try {
        await repo.deleteUser(userId);
        return true;
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name === DynamoErrorName.ConditionalCheckFailed
        ) {
          throw new GraphQLError('User not found', {
            extensions: { code: GraphQLErrorCode.NotFound },
          });
        }
        throw err;
      }
    },
  },
};
