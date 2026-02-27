import { Logger } from '@aws-lambda-powertools/logger';

// Singleton — evaluated once per cold start, reused across warm invocations.
// LOG_LEVEL is read from the LOG_LEVEL environment variable automatically.
// Defaults to INFO if not set.
export const logger = new Logger({ serviceName: 'showcase-api' });
