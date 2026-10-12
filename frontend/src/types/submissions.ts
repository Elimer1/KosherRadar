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

// Text inputs stay strings; they are converted (numbers, keyword list) just before sending.
export interface RestaurantFormValues {
  name: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  foodType: string;
  categories: string[];
  foodKeywords: string;
  claimedHechsher: string;
  claimedHechsherOther: string;
  claimedKashrutLevel: string;
  geoapifyPlaceId: string;
}

export const emptyRestaurantForm: RestaurantFormValues = {
  name: '',
  address: '',
  city: '',
  latitude: '',
  longitude: '',
  phone: '',
  website: '',
  foodType: '',
  categories: [],
  foodKeywords: '',
  claimedHechsher: '',
  claimedHechsherOther: '',
  claimedKashrutLevel: '',
  geoapifyPlaceId: '',
};

export interface RestaurantSubmitResult {
  restaurant: { id: string; status: string };
  teuda: { id: string; status: string } | null;
  possibleDuplicateCount: number;
}

export interface ReportFormValues {
  type: string;
  teudaId: string;
  description: string;
  proposedHechsher: string;
  proposedHechsherOther: string;
  proposedKashrutLevel: string;
}

export const emptyReportForm: ReportFormValues = {
  type: 'GENERAL',
  teudaId: '',
  description: '',
  proposedHechsher: '',
  proposedHechsherOther: '',
  proposedKashrutLevel: '',
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
