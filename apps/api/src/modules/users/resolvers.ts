import { randomUUID } from 'crypto';

import { GraphQLError } from 'graphql';

import { DynamoErrorName, GraphQLErrorCode } from '../../lib/errors.js';
import * as repo from './userRepository.js';
import type { UserRecord } from './userRepository.js';

export const resolvers = {
  Query: {
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
    createUser: async (
      _: unknown,
      { input }: { input: { name: string; email: string } }
    ): Promise<UserRecord> => {
      const existing = await repo.getUser({ email: input.email });
      if (existing) {
        throw new GraphQLError('Email already in use', {
          extensions: { code: GraphQLErrorCode.BadUserInput },
        });
      }
      const user: UserRecord = {
        userId: randomUUID(),
        name: input.name,
        email: input.email,
        createdAt: new Date().toISOString(),
      };
      await repo.putUser(user);
      return user;
    },

    updateUser: async (
      _: unknown,
      {
        userId,
        input,
      }: { userId: string; input: { name?: string } }
    ): Promise<UserRecord> => {
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
      { userId }: { userId: string }
    ): Promise<boolean> => {
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
