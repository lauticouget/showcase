import { gql } from '@apollo/client';

export {
  type CreateUserInput,
  type UpdateUserInput,
  type User,
  type UsersPage,
} from '../generated/types';
export type {
  CreateUserMutation,
  CreateUserMutationVariables,
  DeleteUserMutation,
  DeleteUserMutationVariables,
  GetUserQuery,
  GetUserQueryVariables,
  ListUsersQuery,
  ListUsersQueryVariables,
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '../generated/types';

export const GET_USER_QUERY = gql`
  query GetUser($userId: ID!) {
    getUser(userId: $userId) {
      userId
      name
      email
      createdAt
      updatedAt
    }
  }
`;

export const LIST_USERS_QUERY = gql`
  query ListUsers($limit: Int, $cursor: String) {
    listUsers(limit: $limit, cursor: $cursor) {
      items {
        userId
        name
        email
        createdAt
        updatedAt
      }
      nextCursor
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      userId
      name
      email
      createdAt
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($userId: ID!, $input: UpdateUserInput!) {
    updateUser(userId: $userId, input: $input) {
      userId
      name
      updatedAt
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;
