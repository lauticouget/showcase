import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    userId: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String
  }

  input UpdateUserInput {
    name: String
  }

  type UsersPage {
    items: [User!]!
    nextCursor: String
  }

  type Query {
    me: User
    getUser(userId: ID!): User!
    listUsers(limit: Int, cursor: String): UsersPage!
  }

  type Mutation {
    updateUser(userId: ID!, input: UpdateUserInput!): User!
    deleteUser(userId: ID!): Boolean!
  }
`;
