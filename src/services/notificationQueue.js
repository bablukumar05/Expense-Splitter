import { logger } from '../utils/logger.js';
import { sendEmail } from '../utils/sendEmail.js';
import { isSmtpConfigured } from '../config/env.js';

const MAX_ATTEMPTS = 3;
const MAX_QUEUE_SIZE = 1000;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class NotificationQueue {
  constructor(deliver = sendEmail, {
    configured = isSmtpConfigured,
    maxAttempts = MAX_ATTEMPTS,
    maxQueueSize = MAX_QUEUE_SIZE,
    delay = wait
  } = {}) {
    this.deliver = deliver;
    this.configured = configured;
    this.maxAttempts = maxAttempts;
    this.maxQueueSize = maxQueueSize;
    this.delay = delay;
    this.pending = [];
    this.processing = false;
  }

  enqueue(notification) {
    if (this.pending.length >= this.maxQueueSize) {
      logger.error('Email notification queue is full; dropping notification');
      return false;
    }
    this.pending.push({ notification, attempts: 0 });
    if (!this.processing) {
      this.processing = true;
      setImmediate(() => { void this.drain(); });
    }
    return true;
  }

  async drain() {
    while (this.pending.length > 0) {
      const job = this.pending.shift();
      const { notification } = job;
      if (typeof notification !== 'function' && !this.configured) {
        logger.info(`[EMAIL SKIPPED] To: ${notification.to} | Subject: ${notification.subject}`);
        continue;
      }

      try {
        if (typeof notification === 'function') await notification();
        else await this.deliver(notification);
      } catch (error) {
        job.attempts += 1;
        if (job.attempts < this.maxAttempts) {
          await this.delay(1000 * 2 ** job.attempts);
          this.pending.push(job);
        } else {
          logger.error(`Email to ${notification.to} failed after ${this.maxAttempts} attempts: ${error.message}`);
        }
      }
    }
    this.processing = false;
    if (this.pending.length > 0) {
      this.processing = true;
      setImmediate(() => { void this.drain(); });
    }
  }
}

export const notificationQueue = new NotificationQueue();