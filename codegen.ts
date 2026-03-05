import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'apps/api/src/modules/**/typeDefs.ts',
  documents: 'apps/web/src/lib/graphql/operations/**/*.ts',
  generates: {
    'apps/web/src/lib/graphql/generated/types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        avoidOptionals: true,
        enumsAsTypes: true,
        skipTypename: true,
      },
    },
  },
};

export default config;
