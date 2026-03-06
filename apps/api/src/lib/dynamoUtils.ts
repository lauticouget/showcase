import {
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

import { docClient } from './dynamodb.js';
import { AppError, AppErrorCode } from './errors.js';
import { logger } from './logger.js';

export const DynamoOperation = {
  PutItem: 'PutItem',
  GetItem: 'GetItem',
  Query: 'Query',
  Scan: 'Scan',
  UpdateItem: 'UpdateItem',
  DeleteItem: 'DeleteItem',
} as const;

export type DynamoOperation =
  (typeof DynamoOperation)[keyof typeof DynamoOperation];

export interface PageResult<T> {
  items: T[];
  nextCursor?: string;
}

export async function scanPage<T>(
  tableName: string,
  limit: number,
  cursor?: string
): Promise<PageResult<T>> {
  const exclusiveStartKey = cursor
    ? (JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf-8')
      ) as Record<string, unknown>)
    : undefined;

  const result = await timedOperation(
    tableName,
    DynamoOperation.Scan,
    () =>
      docClient.send(
        new ScanCommand({
          TableName: tableName,
          Limit: limit,
          ...(exclusiveStartKey && {
            ExclusiveStartKey: exclusiveStartKey,
          }),
        })
      )
  );

  return {
    items: (result.Items ?? []) as T[],
    nextCursor: result.LastEvaluatedKey
      ? Buffer.from(
          JSON.stringify(result.LastEvaluatedKey)
        ).toString('base64url')
      : undefined,
  };
}

export async function updateItem<T>(
  tableName: string,
  key: Record<string, unknown>,
  fields: Record<string, unknown>
): Promise<T> {
  const updates = Object.entries({
    ...fields,
    updatedAt: new Date().toISOString(),
  }).filter(([, v]) => v !== undefined);
  if (updates.length === 0)
    throw new AppError(AppErrorCode.EmptyUpdate);

  const expressions = updates.map((_, i) => `#f${i} = :v${i}`);
  const names = Object.fromEntries(
    updates.map(([k], i) => [`#f${i}`, k])
  );
  const values = Object.fromEntries(
    updates.map(([, v], i) => [`:v${i}`, v])
  );
  const [partitionKeyName] = Object.keys(key);

  const result = await timedOperation(
    tableName,
    DynamoOperation.UpdateItem,
    () =>
      docClient.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: `SET ${expressions.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ConditionExpression: `attribute_exists(${partitionKeyName})`,
          ReturnValues: 'ALL_NEW',
        })
      )
  );

  return result.Attributes as T;
}

export async function timedOperation<T>(
  tableName: string,
  operation: string,
  asyncOperation: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    logger.debug(`DynamoDB ${operation} starting`, {
      tableName,
    });
    const result = await asyncOperation();
    logger.info(`DynamoDB ${operation} succeeded`, {
      tableName,
      durationMs: Date.now() - start,
    });
    return result;
  } catch (err) {
    logger.error(`DynamoDB ${operation} failed`, {
      tableName,
      durationMs: Date.now() - start,
      error: err,
    });
    throw err;
  }
}
