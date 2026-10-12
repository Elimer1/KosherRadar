// NEW (Milestone 3): the page opened from the emailed link. The user chooses a new password; the one-time
// token comes from the address. The user is not logged in automatically: they log in with the new password.
// חדש (אבן דרך 3): הדף שנפתח מהקישור במייל. המשתמש בוחר סיסמה חדשה; הטוקן החד-פעמי מגיע מהכתובת.
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import { getErrorMessage } from '../api/errors';
import FormAlert from '../components/FormAlert';
import PasswordField from '../components/PasswordField';
import { primaryButtonClassName } from '../components/formStyles';
import { readResetToken } from '../utils/resetToken';

function ResetPasswordPage() {
  const location = useLocation();
  const token = readResetToken(location.search);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not change the password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Reset link not valid</h1>
        <FormAlert message="This reset link is not valid. Please request a new one." />
        <Link to="/forgot-password" className="inline-block font-medium text-green-700 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Password changed</h1>
        <FormAlert kind="success" message="Your password was changed. You can log in now." />
        <Link to="/login" className="inline-block font-medium text-green-700 hover:underline">
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-gray-900">Choose a new password</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormAlert message={error} />

        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          hint="At least 8 characters."
          value={password}
          onChange={setPassword}
        />

        <PasswordField
          id="reset-confirm-password"
          label="Confirm new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        <button type="submit" disabled={loading} className={primaryButtonClassName}>
          {loading ? 'Saving...' : 'Change password'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-gray-600">
          If the link has expired or was already used,{' '}
          <Link to="/forgot-password" className="font-medium text-green-700 hover:underline">
            request a new one
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default ResetPasswordPage;
