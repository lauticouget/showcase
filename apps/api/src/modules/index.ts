import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import type { IResolvers } from '@graphql-tools/utils';
import type { DocumentNode } from 'graphql';

import * as health from './health';

// Add new modules here
const modules = [health];

export const typeDefs: DocumentNode = mergeTypeDefs(
  modules.map((m) => m.typeDefs)
);
export const resolvers: IResolvers = mergeResolvers(
  modules.map((m) => m.resolvers)
);
