// NEW (Milestone 3): "forgot password" page. It shows the same message whether or not the email has an account,
// and it never claims that an email was sent.
// חדש (אבן דרך 3): דף "שכחתי סיסמה". מציג אותה הודעה בין אם יש חשבון ובין אם לא, ולא טוען שנשלח מייל.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import { inputClassName, labelClassName, primaryButtonClassName } from '../components/formStyles';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      setMessage(await requestPasswordReset(email));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the request. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <FormAlert kind="success" message={message} />
        <p className="text-sm text-gray-600">The link works once and expires after one hour.</p>
        <Link to="/login" className="inline-block font-medium text-green-700 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
      <p className="mt-2 text-sm text-gray-600">Enter your email and we will send you a link to choose a new one.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <div>
          <label htmlFor="forgot-email" className={labelClassName}>
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
          />
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        <Link to="/login" className="font-medium text-green-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
