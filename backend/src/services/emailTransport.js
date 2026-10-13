import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const EMAIL_SENT = 'SENT';
export const EMAIL_FAILED = 'FAILED';
export const EMAIL_NOT_CONFIGURED = 'NOT_CONFIGURED';

export const emailConfigurationProblem = () => {
  if (!env.emailUser || !env.emailAppPassword) return 'Set EMAIL_USER and EMAIL_APP_PASSWORD';
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(env.emailUser)) return 'EMAIL_USER must be an email address';
  if (!/^[a-zA-Z0-9]{16}$/.test(env.emailAppPassword.replace(/\s/g, ''))) {
    return 'EMAIL_APP_PASSWORD must be a 16-character Google app password';
  }
  return '';
};

export const isEmailConfigured = () => !emailConfigurationProblem();

// Do not log SMTP responses, message bodies or exception messages: they may contain reset tokens.
export const sendEmailService = async ({ to, subject, text, html }) => {
  const problem = emailConfigurationProblem();
  if (problem) {
    console.error(`Email not configured: ${problem}`);
    return EMAIL_NOT_CONFIGURED;
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(to || '') || /[\r\n]/.test(subject || '')) {
    console.error('Email not sent: invalid recipient or subject');
    return EMAIL_FAILED;
  }
  try {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.emailUser, pass: env.emailAppPassword.replace(/\s/g, '') },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
      logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
    });
    const result = await transport.sendMail({
      from: { name: 'KosherRadar', address: env.emailUser }, to, subject, text, html,
    });
    return result.accepted?.includes(to) ? EMAIL_SENT : EMAIL_FAILED;
  } catch (error) {
    const diagnostic = error.code === 'EAUTH' ? 'Gmail authentication failed; check the app password and account policy'
      : error.code === 'ETIMEDOUT' ? 'Gmail SMTP timed out'
      : 'Gmail SMTP delivery failed; check connectivity, quota and account policy';
    console.error(diagnostic);
    return EMAIL_FAILED;
  }
};
