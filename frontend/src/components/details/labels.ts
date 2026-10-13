// NEW (Visual v2): restaurant details presentation; existing contracts and status labels stay authoritative.
// חדש (עיצוב 2): תצוגת פרטי מסעדה תוך שמירה על חוזים ותוויות קיימים.
// Phrases this page needs that are not in the shared locale files.
// The Hebrew lines need native-speaker review.
import { activeLanguage } from '../../i18n';

export const directionsWord = () => (activeLanguage() === 'he' ? 'ניווט' : 'Directions');

export const evidenceHeading = () => (activeLanguage() === 'he' ? 'תעודות וראיות' : 'Certificates and evidence');
