import nodemailer from 'nodemailer';
import { env, isEmailConfigured, isResendConfigured } from '../config/env.js';
import { AppError } from './AppError.js';

let transporter;

function getTransporter() {
  if (!isEmailConfigured) throw new AppError('Email delivery is not configured', 503);
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured) throw new AppError('Email delivery is not configured', 503);

  if (isResendConfigured) {
    const fromAddress = env.EMAIL_FROM || env.SMTP_FROM || 'Expense Splitter <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html: html || undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend email delivery failed (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  return getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}