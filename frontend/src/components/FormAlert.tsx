interface FormAlertProps {
  message: string;
  kind?: 'error' | 'success' | 'warning';
}

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-forest bg-mist text-forest',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
};

function FormAlert({ message, kind = 'error' }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3 py-2.5 text-sm leading-relaxed ${styles[kind]}`}>
      {message}
    </p>
  );
}

export default FormAlert;
