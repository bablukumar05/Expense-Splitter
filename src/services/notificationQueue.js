import { logger } from '../utils/logger.js';
import { sendEmail } from '../utils/sendEmail.js';

export class NotificationQueue {
  constructor(deliver = sendEmail) {
    this.deliver = deliver;
    this.pending = [];
    this.processing = false;
  }

  enqueue(notification) {
    this.pending.push(notification);
    if (!this.processing) {
      this.processing = true;
      setImmediate(() => { void this.drain(); });
    }
  }

  async drain() {
    while (this.pending.length > 0) {
      const notification = this.pending.shift();
      try {
        if (typeof notification === 'function') await notification();
        else await this.deliver(notification);
      } catch (error) {
        logger.warn('Queued email notification failed', {
          message: error.message,
          recipient: notification.to
        });
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