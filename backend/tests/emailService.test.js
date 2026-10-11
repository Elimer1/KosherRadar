// NEW (Milestone 3): tests for the Resend email service and the rejection email text.
// חדש (אבן דרך 3): בדיקות לשירות המייל (Resend) ולנוסח מייל הדחייה.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '../src/config/env.js';
import {
  EMAIL_FAILED,
  EMAIL_NOT_CONFIGURED,
  EMAIL_SENT,
  buildPasswordResetEmail,
  buildRejectionEmail,
  sendEmailService,
  sendRejectionEmailService,
} from '../src/services/emailService.js';

describe('sendEmailService', () => {
  let consoleError;

  beforeEach(() => {
    env.resendApiKey = 're_test_key';
    env.emailFrom = 'KosherRadar <noreply@example.com>';
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    env.resendApiKey = '';
    env.emailFrom = '';
    vi.unstubAllGlobals();
    consoleError.mockRestore();
  });

  it('returns NOT_CONFIGURED without calling Resend when the key is missing', async () => {
    env.resendApiKey = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const status = await sendEmailService({ to: 'a@b.com', subject: 's', text: 't' });

    expect(status).toBe(EMAIL_NOT_CONFIGURED);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the email with the API key in the header and returns SENT', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const status = await sendEmailService({ to: 'a@b.com', subject: 'Hi', text: 'Body' });

    expect(status).toBe(EMAIL_SENT);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(request.headers.Authorization).toBe('Bearer re_test_key');
    expect(JSON.parse(request.body)).toEqual({
      from: 'KosherRadar <noreply@example.com>',
      to: ['a@b.com'],
      subject: 'Hi',
      text: 'Body',
    });
  });

  it('returns FAILED and logs when Resend answers with an error, without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, text: async () => 'domain not verified' }));

    const status = await sendEmailService({ to: 'a@b.com', subject: 's', text: 't' });

    expect(status).toBe(EMAIL_FAILED);
    expect(consoleError).toHaveBeenCalled();
  });

  it('returns FAILED when the network call itself fails, without throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(sendEmailService({ to: 'a@b.com', subject: 's', text: 't' })).resolves.toBe(EMAIL_FAILED);
  });
});

describe('rejection email', () => {
  it('contains the restaurant name and the reason, and no admin note', () => {
    const email = buildRejectionEmail({
      kind: 'restaurant',
      subjectName: 'Pizza Hut',
      reason: 'We could not find this place',
    });

    expect(email.subject).toContain('restaurant submission');
    expect(email.text).toContain('Pizza Hut');
    expect(email.text).toContain('Reason: We could not find this place');
    expect(email.text).not.toMatch(/admin note/i);
  });

  it('uses a different wording for certificates and reports', () => {
    expect(buildRejectionEmail({ kind: 'certificate', subjectName: 'x', reason: 'r' }).subject).toContain(
      'certificate'
    );
    expect(buildRejectionEmail({ kind: 'report', subjectName: 'x', reason: 'r' }).subject).toContain('report');
  });

  it('sendRejectionEmailService reports FAILED when the submitter has no email', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      sendRejectionEmailService({ to: undefined, kind: 'report', subjectName: 'x', reason: 'r' })
    ).resolves.toBe(EMAIL_FAILED);

    consoleError.mockRestore();
  });
});

// NEW (Milestone 3): the password reset email text.
describe('buildPasswordResetEmail', () => {
  it('contains the link and the validity time, and is plain text', () => {
    const { subject, text } = buildPasswordResetEmail({
      resetLink: 'http://localhost:5173/reset-password?token=abc',
      validMinutes: 60,
    });

    expect(subject).toBe('Reset your KosherRadar password');
    expect(text).toContain('http://localhost:5173/reset-password?token=abc');
    expect(text).toContain('60 minutes');
    expect(text).toContain('If you did not ask for this');
    expect(text).not.toContain('<');
  });
});
