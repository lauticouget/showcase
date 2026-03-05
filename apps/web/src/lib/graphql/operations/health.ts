import { gql } from '@apollo/client';

export type { HealthQuery, HealthQueryVariables } from '../generated/types';

export const HEALTH_QUERY = gql`
  query Health {
    health
  }
`;
