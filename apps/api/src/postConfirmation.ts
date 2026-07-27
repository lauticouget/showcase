import type { PostConfirmationTriggerHandler } from 'aws-lambda';

import { logger } from './lib/logger.js';
import * as repo from './modules/users/userRepository.js';

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { sub, email, name } = event.request.userAttributes;

  logger.info('PostConfirmation trigger fired', { sub, email });

  await repo.putUser({
    userId: sub,
    name: name ?? email.split('@')[0],
    email,
    createdAt: new Date().toISOString(),
  });

  return event;
};
