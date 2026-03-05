import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Singleton — evaluated once per cold start, reused across warm invocations.
// DYNAMODB_ENDPOINT overrides the endpoint for local development (DynamoDB Local).
// Absent in real Lambda, so the SDK auto-resolves the AWS regional endpoint.
const rawClient = new DynamoDBClient(
  process.env['DYNAMODB_LOCAL_ENDPOINT']
    ? { endpoint: process.env['DYNAMODB_LOCAL_ENDPOINT'] }
    : {}
);

export const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    // Prevents marshaling errors from optional fields (e.g. updatedAt).
    removeUndefinedValues: true,
  },
});
