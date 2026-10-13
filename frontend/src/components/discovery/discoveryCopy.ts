// Short discovery lines that are not in the shared locale files.
// Hebrew needs native-speaker review before these strings move into locales/he.ts.
import { activeLanguage } from '../../i18n';

export interface DiscoveryMethodCopy {
  title: string;
  body: string;
}

export interface DiscoveryCopy {
  lead: string;
  methods: [DiscoveryMethodCopy, DiscoveryMethodCopy, DiscoveryMethodCopy];
}

const english: DiscoveryCopy = {
  lead: 'Find kosher places with clearer information',
  methods: [
    {
      title: 'Search by restaurant',
      body: 'Look up a place by its name or the food it serves.',
    },
    {
      title: 'Explore an area',
      body: 'Choose a city or neighborhood and see what is listed there.',
    },
    {
      title: 'Near me',
      body: 'Use your current location to see places around you.',
    },
  ],
};

const hebrew: DiscoveryCopy = {
  lead: 'מצאו מקומות כשרים עם מידע ברור יותר',
  methods: [
    {
      title: 'חיפוש לפי מסעדה',
      body: 'חפשו מקום לפי השם או לפי האוכל שהוא מגיש.',
    },
    {
      title: 'עיון באזור',
      body: 'בחרו עיר או שכונה וראו מה רשום בה.',
    },
    {
      title: 'בקרבתי',
      body: 'השתמשו במיקום הנוכחי כדי לראות מקומות בסביבה.',
    },
  ],
};

export const discoveryCopy = (): DiscoveryCopy => (activeLanguage() === 'he' ? hebrew : english);
