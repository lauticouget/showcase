import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from './index';

describe('health module', () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  describe('Query.health', () => {
    it('returns OK', async () => {
      const result = await graphql({ schema, source: '{ health }' });

      expect(result.errors).toBeUndefined();
      expect(result.data?.health).toBe('OK');
    });
  });
});
