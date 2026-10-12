// NEW (Milestone 3): types for the admin dashboard. They match what the /api/admin endpoints send.
// חדש (אבן דרך 3): טיפוסים ללוח הניהול. תואמים למה שנקודות הקצה של /api/admin שולחות.

export interface PageResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserBrief {
  id: string;
  email: string | null;
}

export interface RestaurantBrief {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  status: string | null;
}

export interface PossibleDuplicate {
  restaurant: RestaurantBrief | null;
  reasons: string[];
}

export interface AdminRestaurant {
  id: string;
  name: string;
  nameHe: string | null;
  nameEn: string | null;
  address: string;
  addressHe: string | null;
  addressEn: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  geoapifyPlaceId: string | null;
  phone: string | null;
  website: string | null;
  foodType: string | null;
  categories: string[];
  foodKeywords: string[];
  claimedHechsher: string | null;
  claimedHechsherOther: string | null;
  claimedKashrutLevel: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: UserBrief | null;
  adminNote: string | null;
  rejectionReason: string | null;
  kosharotUrl: string | null;
  possibleDuplicates: PossibleDuplicate[];
  createdAt: string;
}

// VALID and RECENT_EXPIRED certificates are public. ADMIN_ONLY ones expired more than six months ago.
export type TeudaVisibility = 'VALID' | 'RECENT_EXPIRED' | 'ADMIN_ONLY';

export interface ConflictBrief {
  id: string;
  hechsher: string;
  hechsherOther: string | null;
  kashrutLevel: string;
  expirationDate: string;
}

export interface AdminTeuda {
  id: string;
  restaurant: RestaurantBrief | null;
  hechsher: string;
  hechsherOther: string | null;
  kashrutLevel: string;
  expirationDate: string;
  visibility: TeudaVisibility;
  photoUrl: string;
  mashgiachName: string;
  mashgiachPhone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: UserBrief | null;
  submittedWithNewRestaurant: boolean;
  adminNote: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface PendingTeuda extends AdminTeuda {
  restaurantApproved: boolean;
  conflicts: ConflictBrief[];
}

export interface ExpiringTeuda extends AdminTeuda {
  daysLeft: number;
}

export interface AdminReport {
  id: string;
  restaurant: RestaurantBrief | null;
  teuda: {
    id: string;
    hechsher: string;
    hechsherOther: string | null;
    kashrutLevel: string;
    expirationDate: string;
  } | null;
  submittedBy: UserBrief | null;
  type: 'GENERAL' | 'KASHRUT_UPDATE';
  description: string;
  photoUrl: string | null;
  proposedHechsher: string | null;
  proposedHechsherOther: string | null;
  proposedKashrutLevel: string | null;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  adminNote: string | null;
  rejectionReason: string | null;
  correctionApplied: boolean;
  createdAt: string;
}

// SENT: the email went out. FAILED / NOT_CONFIGURED: the rejection is saved, but the user was not emailed.
export type EmailStatus = 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export interface PointsResult {
  awarded: boolean;
  points: number;
  reason: string;
}

export interface AdminRestaurantDetails {
  restaurant: AdminRestaurant;
  teudot: (AdminTeuda & { conflicts: ConflictBrief[] })[];
  publicKashrutPreview: KashrutPreview | null;
}

export interface KashrutPreviewItem {
  kind: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
  hechsher: string | null;
  hechsherOther: string | null;
  kashrutLevel: string | null;
  expirationDate: string | null;
}

export interface KashrutPreview {
  status: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED' | 'UNKNOWN';
  primary: KashrutPreviewItem | null;
  moreCount: number;
  items: KashrutPreviewItem[];
  hasRecentExpired: boolean;
}

// How an admin handled a report (see the server's REPORT_RESOLUTIONS).
export type ReportResolution = 'APPLY_PROPOSED' | 'CORRECTION_ALREADY_MADE' | 'NO_CORRECTION';

// The admin-only fields of the restaurant form. Every field is text because HTML inputs give text.
export interface RestaurantExtrasValues {
  nameHe: string;
  nameEn: string;
  addressHe: string;
  addressEn: string;
  adminNote: string;
  kosharotUrl: string;
}

export const emptyRestaurantExtras: RestaurantExtrasValues = {
  nameHe: '',
  nameEn: '',
  addressHe: '',
  addressEn: '',
  adminNote: '',
  kosharotUrl: '',
};
