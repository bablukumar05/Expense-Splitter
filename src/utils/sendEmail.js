import nodemailer from 'nodemailer';
import { env, isSmtpConfigured } from '../config/env.js';
import { AppError } from './AppError.js';

let transporter;

function getTransporter() {
  if (!isSmtpConfigured) throw new AppError('Email delivery is not configured', 503);
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
  return getTransporter().sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    text,
    html
  });
}