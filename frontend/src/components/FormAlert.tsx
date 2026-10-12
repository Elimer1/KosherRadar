interface FormAlertProps {
  message: string;
  kind?: 'error' | 'success' | 'warning';
}

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
};

function FormAlert({ message, kind = 'error' }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${styles[kind]}`}>
      {message}
    </p>
  );
}

export default FormAlert;
