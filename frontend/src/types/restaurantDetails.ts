// NEW (Milestone 4): types for the public restaurant page.
// חדש (אבן דרך 4): טיפוסים לדף המסעדה הציבורי.
import type { KashrutEvidenceKind, KashrutPreview } from './search';

// One piece of kashrut evidence: a verified certificate, an expired one, or an unverified claim.
export interface KashrutEvidenceItem {
  kind: KashrutEvidenceKind;
  // Null for an unverified claim, because a claim has no certificate behind it.
  teudaId: string | null;
  hechsher: string | null;
  hechsherOther: string | null;
  kashrutLevel: string | null;
  expirationDate: string | null;
}

// A certificate the public may see (approved, and not expired for more than six months).
export interface PublicTeuda {
  id: string;
  hechsher: string;
  hechsherOther: string | null;
  kashrutLevel: string;
  expirationDate: string;
  visibility: 'VALID' | 'RECENT_EXPIRED';
  photoUrl: string | null;
  mashgiachName: string | null;
  mashgiachPhone: string | null;
}

export interface RestaurantDetails {
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
  phone: string | null;
  website: string | null;
  foodType: string;
  categories: string[];
  foodKeywords: string[];
  // A link to the restaurant's page on the Kosharot website, only when an admin checked it.
  kosharotUrl: string | null;
  kashrut: KashrutPreview & { items: KashrutEvidenceItem[] };
  teudot: PublicTeuda[];
}
