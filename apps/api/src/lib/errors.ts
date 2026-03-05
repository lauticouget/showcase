export enum AppErrorCode {
  EmptyUpdate = 'EMPTY_UPDATE',
}

export class AppError extends Error {
  constructor(public readonly code: AppErrorCode) {
    super(AppError.messages[code]);
    this.name = 'AppError';
  }

  private static readonly messages: Record<AppErrorCode, string> = {
    [AppErrorCode.EmptyUpdate]:
      'updateItem requires at least one field to update',
  };
}

export const DynamoErrorName = {
  ConditionalCheckFailed: 'ConditionalCheckFailedException',
} as const;

export { GraphQLErrorCode } from '@showcase/shared';
