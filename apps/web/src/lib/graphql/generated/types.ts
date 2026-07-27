export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  deleteUser: Scalars['Boolean']['output'];
  updateUser: User;
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  userId: Scalars['ID']['input'];
};

export type Query = {
  getUser: User;
  health: Scalars['String']['output'];
  listUsers: UsersPage;
  me: Maybe<User>;
};


export type QueryGetUserArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryListUsersArgs = {
  cursor: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateUserInput = {
  name: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['String']['output']>;
  userId: Scalars['ID']['output'];
};

export type UsersPage = {
  items: Array<User>;
  nextCursor: Maybe<Scalars['String']['output']>;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { health: string };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { userId: string, name: string, email: string, createdAt: string, updatedAt: string | null } | null };

export type GetUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserQuery = { getUser: { userId: string, name: string, email: string, createdAt: string, updatedAt: string | null } };

export type ListUsersQueryVariables = Exact<{
  limit: InputMaybe<Scalars['Int']['input']>;
  cursor: InputMaybe<Scalars['String']['input']>;
}>;


export type ListUsersQuery = { listUsers: { nextCursor: string | null, items: Array<{ userId: string, name: string, email: string, createdAt: string, updatedAt: string | null }> } };

export type UpdateUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { userId: string, name: string, updatedAt: string | null } };

export type DeleteUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { deleteUser: boolean };
