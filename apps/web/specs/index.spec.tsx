import { MockedProvider as MockedApolloProvider } from '@apollo/client/testing/react';
import { render } from '@testing-library/react';

import Page from '../src/app/page';
import { UserProvider } from '../src/lib/context/UserContext';
import { HEALTH_QUERY } from '../src/lib/graphql/operations';

const mocks = [
  {
    request: { query: HEALTH_QUERY },
    result: { data: { health: 'OK' } },
  },
];

describe('Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <MockedApolloProvider mocks={mocks}>
        <UserProvider>
          <Page />
        </UserProvider>
      </MockedApolloProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
