import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/config/env.js', () => ({ env: {
  emailUser: '', emailAppPassword: '', clientUrl: 'http://localhost:5173',
} }));
vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn() } }));

import nodemailer from 'nodemailer';
import { env } from '../src/config/env.js';
import {
  EMAIL_FAILED, EMAIL_NOT_CONFIGURED, EMAIL_SENT, buildPasswordResetEmail, buildRejectionEmail,
  buildApprovalEmail, buildPasswordChangedEmail, sendEmailService, sendRejectionEmailService,
  sendPasswordResetEmailService,
} from '../src/services/emailService.js';

const TOKEN = 'a'.repeat(64);
const resetLink = `http://localhost:5173/reset-password?token=${TOKEN}`;
let consoleError;
let sendMail;

beforeEach(() => {
  vi.clearAllMocks();
  env.emailUser = 'sender@gmail.com';
  env.emailAppPassword = 'abcd efgh ijkl mnop';
  env.clientUrl = 'http://localhost:5173';
  sendMail = vi.fn().mockResolvedValue({ accepted: ['a@b.com'], rejected: [] });
  nodemailer.createTransport.mockReturnValue({ sendMail });
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => consoleError.mockRestore());

describe('Gmail transport (mocked; never sends real email)', () => {
  it.each([
    ['', 'abcdefghijklmnop'], ['sender@gmail.com', ''], ['bad-address', 'abcdefghijklmnop'],
    ['sender@gmail.com', 'ordinary-password'],
  ])('returns NOT_CONFIGURED for invalid configuration', async (user, password) => {
    env.emailUser = user;
    env.emailAppPassword = password;
    expect(await sendEmailService({ to: 'a@b.com', subject: 'Hi', text: 'Body' })).toBe(EMAIL_NOT_CONFIGURED);
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });

  it('uses Gmail app authentication and both HTML/text; SENT means recipient accepted', async () => {
    expect(await sendEmailService({ to: 'a@b.com', subject: 'Hi', text: 'Body', html: '<p>Body</p>' })).toBe(EMAIL_SENT);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      service: 'gmail', auth: { user: 'sender@gmail.com', pass: 'abcdefghijklmnop' },
      debug: false, logger: false, socketTimeout: 10000, disableFileAccess: true, disableUrlAccess: true,
    }));
    expect(sendMail).toHaveBeenCalledWith({ from: { name: 'KosherRadar', address: 'sender@gmail.com' },
      to: 'a@b.com', subject: 'Hi', text: 'Body', html: '<p>Body</p>' });
  });

  it.each(['EAUTH', 'ETIMEDOUT', 'ECONNECTION'])('sanitizes delivery failures (%s)', async (code) => {
    sendMail.mockRejectedValue(Object.assign(new Error(`secret ${resetLink} password`), { code }));
    expect(await sendEmailService({ to: 'a@b.com', subject: 'Hi', text: resetLink })).toBe(EMAIL_FAILED);
    expect(consoleError).toHaveBeenCalled();
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TOKEN);
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('secret');
  });

  it('returns FAILED when SMTP did not accept the recipient', async () => {
    sendMail.mockResolvedValue({ accepted: [], rejected: ['a@b.com'] });
    expect(await sendEmailService({ to: 'a@b.com', subject: 'Hi', text: 'Body' })).toBe(EMAIL_FAILED);
  });

  it('rejects missing recipients and header injection without sending', async () => {
    expect(await sendRejectionEmailService({ kind: 'report', subjectName: 'x', reason: 'r' })).toBe(EMAIL_FAILED);
    expect(await sendEmailService({ to: 'a@b.com', subject: 'Hi\r\nBcc: evil@example.com' })).toBe(EMAIL_FAILED);
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe('branded bilingual email templates', () => {
  it.each(['en', 'he'])('renders all four templates with HTML/text, branding and disclaimer (%s)', (language) => {
    const templates = [
      buildPasswordResetEmail({ resetLink, validMinutes: 60, language }), buildPasswordChangedEmail({ language }),
      buildRejectionEmail({ kind: 'restaurant', subjectName: 'Cafe', reason: 'Public reason', language }),
      buildApprovalEmail({ kind: 'certificate', subjectName: 'Cafe', language }),
    ];
    for (const email of templates) {
      expect(email.subject).toContain('KosherRadar');
      expect(email.text).toContain('KosherRadar');
      expect(email.html).toContain(`lang="${language}" dir="${language === 'he' ? 'rtl' : 'ltr'}"`);
      expect(email.html).toContain('role="presentation"');
      expect(email.html).toContain(language === 'he' ? 'ולא גוף שמעניק אישורי כשרות' : 'not a kashrut certification authority');
    }
  });

  it('escapes user content and never includes private notes', () => {
    const email = buildRejectionEmail({ kind: 'restaurant', subjectName: '<img src=x onerror=alert(1)>',
      reason: 'Public & "reason" <script>bad</script>', adminNote: 'PRIVATE SECRET' });
    expect(email.html).not.toContain('<img');
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
    expect(email.html).toContain('&amp;');
    expect(email.text).toContain('Reason: Public & "reason"');
    expect(JSON.stringify(email)).not.toContain('PRIVATE SECRET');
    expect(email.subject).toContain('restaurant submission');
  });

  it('preserves kinds and uses English for unsupported languages', () => {
    expect(buildRejectionEmail({ kind: 'certificate', subjectName: 'x', reason: 'r' }).subject).toContain('certificate');
    expect(buildRejectionEmail({ kind: 'report', subjectName: 'x', reason: 'r', language: 'fr' }).subject).toContain('report');
  });

  it('includes expiry, raw link only in mail, and password-change security guidance', () => {
    const email = buildPasswordResetEmail({ resetLink, validMinutes: 60 });
    expect(email.subject).toBe('Reset your KosherRadar password');
    expect(email.text).toContain(resetLink);
    expect(email.text).toContain('60 minutes');
    expect(buildPasswordChangedEmail().text).toContain('previous sessions have been invalidated');
  });

  it.each(['https://evil.example/reset-password?token=' + TOKEN, 'javascript:alert(1)',
    'http://localhost:5173/reset-password?token=short', resetLink + '&next=https://evil.example',
    resetLink + '#fragment', 'http://user:pass@localhost:5173/reset-password?token=' + TOKEN,
  ])('rejects untrusted/malformed reset links', async (link) => {
    expect(() => buildPasswordResetEmail({ resetLink: link, validMinutes: 60 })).toThrow();
    expect(await sendPasswordResetEmailService({ to: 'a@b.com', resetLink: link, validMinutes: 60 })).toBe(EMAIL_FAILED);
    expect(sendMail).not.toHaveBeenCalled();
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(TOKEN);
  });

  it('refuses nonlocal HTTP configuration', () => {
    env.clientUrl = 'http://kosherradar.example';
    expect(() => buildPasswordChangedEmail()).toThrow();
  });
});
