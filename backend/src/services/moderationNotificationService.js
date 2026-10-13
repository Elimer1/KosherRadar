// NEW (Milestone 3): tells a contributor why their submission was rejected, after the decision is saved.
// חדש (אבן דרך 3): מודיע למשתמש למה ההגשה שלו נדחתה, אחרי שההחלטה כבר נשמרה.
//
// This function never throws. If the user cannot be found or the email cannot be sent, the admin gets
// FAILED or NOT_CONFIGURED in the response and the rejection stays saved (spec 6 and 12).
// הפונקציה לעולם לא זורקת שגיאה. אם המייל לא נשלח, המנהל מקבל FAILED או NOT_CONFIGURED וההחלטה נשארת שמורה.
import { findUserByIdRepo } from '../repositories/userRepository.js';
import { EMAIL_FAILED, sendApprovalEmailService, sendRejectionEmailService } from './emailService.js';

export const notifyRejectionService = async ({ submitterId, kind, subjectName, reason }) => {
  try {
    const submitter = await findUserByIdRepo(submitterId);

    return await sendRejectionEmailService({
      to: submitter ? submitter.email : undefined,
      kind,
      subjectName,
      reason,
      language: submitter?.preferredLanguage,
    });
  } catch {
    console.error('Rejection notification failed');
    return EMAIL_FAILED;
  }
};

// Called only by the winner of a PENDING -> APPROVED transition, never on retries or admin creation.
export const notifyApprovalService = async ({ submitterId, kind, subjectName }) => {
  try {
    const submitter = await findUserByIdRepo(submitterId);
    if (submitter?.role === 'ADMIN') return;
    return await sendApprovalEmailService({ to: submitter?.email, kind, subjectName,
      language: submitter?.preferredLanguage });
  } catch {
    console.error('Approval notification failed');
    return EMAIL_FAILED;
  }
};
