import { env } from '../config/env.js';
import { sendEmail } from '../utils/sendEmail.js';

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = new URL(`/reset-password/${encodeURIComponent(token)}`, env.FRONTEND_URL);

  await sendEmail({
    to: email,
    subject: 'Reset your Expense Splitter password',
    text: `Use this link to reset your password. It expires in one hour: ${resetUrl.toString()}`
  });
}