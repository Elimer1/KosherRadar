import { EMAIL_FAILED, sendEmailService } from './emailTransport.js';
import { buildApprovalEmail, buildPasswordChangedEmail, buildPasswordResetEmail, buildRejectionEmail } from './emailTemplates.js';

// Preserve caller imports and status semantics while keeping the provider behind one boundary.
export { EMAIL_SENT, EMAIL_FAILED, EMAIL_NOT_CONFIGURED, isEmailConfigured, sendEmailService } from './emailTransport.js';
export { buildApprovalEmail, buildPasswordChangedEmail, buildPasswordResetEmail, buildRejectionEmail } from './emailTemplates.js';

const sendTemplate = async (to, build, data) => {
  try {
    return await sendEmailService({ to, ...build(data) });
  } catch {
    console.error('Email not sent: template or trusted-link configuration is invalid');
    return EMAIL_FAILED;
  }
};

export const sendRejectionEmailService = ({ to, ...data }) => sendTemplate(to, buildRejectionEmail, data);
export const sendApprovalEmailService = ({ to, ...data }) => sendTemplate(to, buildApprovalEmail, data);
export const sendPasswordResetEmailService = ({ to, ...data }) => sendTemplate(to, buildPasswordResetEmail, data);
export const sendPasswordChangedEmailService = ({ to, ...data }) => sendTemplate(to, buildPasswordChangedEmail, data);
