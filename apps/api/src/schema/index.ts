import { makeExecutableSchema } from '@graphql-tools/schema';

import { resolvers, typeDefs } from '../modules';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
