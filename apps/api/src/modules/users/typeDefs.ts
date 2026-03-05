import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    userId: ID!
    name: String!
    email: String!
    createdAt: String!
    updatedAt: String
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input UpdateUserInput {
    name: String
  }

  type UsersPage {
    items: [User!]!
    nextCursor: String
  }

  type Query {
    getUser(userId: ID!): User!
    listUsers(limit: Int, cursor: String): UsersPage!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(userId: ID!, input: UpdateUserInput!): User!
    deleteUser(userId: ID!): Boolean!
  }
`;
