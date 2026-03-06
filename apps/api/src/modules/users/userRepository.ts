import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import { docClient } from '../../lib/dynamodb.js';
import {
  DynamoOperation,
  PageResult,
  scanPage,
  timedOperation,
  updateItem,
} from '../../lib/dynamoUtils.js';

const USERS_TABLE_NAME = (() => {
  const tableName = process.env['USERS_TABLE'];
  if (!tableName)
    throw new Error(
      'USERS_TABLE environment variable is not set'
    );
  return tableName;
})();

export interface UserRecord {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export async function putUser(user: UserRecord): Promise<void> {
  await timedOperation(
    USERS_TABLE_NAME,
    DynamoOperation.PutItem,
    () =>
      docClient.send(
        new PutCommand({
          TableName: USERS_TABLE_NAME,
          Item: user,
        })
      )
  );
}

export async function getUser(
  by: { userId: string } | { email: string }
): Promise<UserRecord | undefined> {
  if ('userId' in by) {
    const result = await timedOperation(
      USERS_TABLE_NAME,
      DynamoOperation.GetItem,
      () =>
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE_NAME,
            Key: { userId: by.userId },
          })
        )
    );
    return result.Item as UserRecord | undefined;
  }

  const result = await timedOperation(
    USERS_TABLE_NAME,
    DynamoOperation.Query,
    () =>
      docClient.send(
        new QueryCommand({
          TableName: USERS_TABLE_NAME,
          IndexName: 'email-index',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: { ':email': by.email },
          Limit: 1,
        })
      )
  );
  return result.Items?.[0] as UserRecord | undefined;
}

export async function listUsers(
  limit = 20,
  cursor?: string
): Promise<PageResult<UserRecord>> {
  return scanPage<UserRecord>(USERS_TABLE_NAME, limit, cursor);
}

export async function updateUser(
  userId: string,
  fields: Partial<Pick<UserRecord, 'name'>>
): Promise<UserRecord> {
  return updateItem<UserRecord>(
    USERS_TABLE_NAME,
    { userId },
    fields
  );
}

export async function deleteUser(userId: string): Promise<void> {
  await timedOperation(
    USERS_TABLE_NAME,
    DynamoOperation.DeleteItem,
    () =>
      docClient.send(
        new DeleteCommand({
          TableName: USERS_TABLE_NAME,
          Key: { userId },
          ConditionExpression: 'attribute_exists(userId)',
        })
      )
  );
}
