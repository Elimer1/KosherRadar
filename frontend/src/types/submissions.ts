export interface HechsherOption {
  value: string;
  labelEn: string;
  labelHe: string;
}

// Form choices sent by GET /options, so the forms always match what the server accepts.
export interface FormOptions {
  hechsherOptions: HechsherOption[];
  hechsherOtherValue: string;
  kashrutLevels: string[];
  foodTypes: string[];
  categories: string[];
  maxImageBytes: number;
}

// Every field is a string because HTML inputs always give strings.
export interface TeudaFormValues {
  hechsher: string;
  hechsherOther: string;
  kashrutLevel: string;
  expirationDate: string;
  mashgiachName: string;
  mashgiachPhone: string;
}

export const emptyTeudaForm: TeudaFormValues = {
  hechsher: '',
  hechsherOther: '',
  kashrutLevel: '',
  expirationDate: '',
  mashgiachName: '',
  mashgiachPhone: '',
};

export interface SubmissionContextTeuda {
  id: string;
  hechsher: string;
  hechsherOther: string | null;
  kashrutLevel: string;
  expirationDate: string;
  visibility: 'VALID' | 'RECENT_EXPIRED';
}

export interface SubmissionContext {
  restaurant: {
    id: string;
    name: string;
    address: string;
    city: string | null;
  };
  teudot: SubmissionContextTeuda[];
}

export interface TeudaSubmitResult {
  teuda: { id: string; status: string };
}
