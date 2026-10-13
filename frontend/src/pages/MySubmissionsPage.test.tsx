// NEW (Agent 3): correction outcomes must render independently of points.
// חדש (סוכן 3): הצגת תוצאות תיקון ללא תלות בנקודות.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SubmissionsPanel } from './MySubmissionsPage';
import { getMySubmissions } from '../api/submissionsApi';

vi.mock('../api/submissionsApi', () => ({ getMySubmissions: vi.fn() }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root; let container: HTMLDivElement;
afterEach(() => { act(() => root?.unmount()); container?.remove(); vi.resetAllMocks(); });
it.each([
  { correctionApplied: true, points: 0, status: 'RESOLVED', expected: 'forms.correctionApplied' },
  { correctionApplied: true, points: 1, status: 'RESOLVED', expected: 'forms.correctionApplied' },
  { correctionApplied: false, points: 1, status: 'RESOLVED', expected: 'forms.closedWithoutChange' },
  { correctionApplied: false, points: 0, status: 'RESOLVED', expected: 'forms.closedWithoutChange' },
] as const)('renders $expected with $points points', async ({ correctionApplied, points, status, expected }) => {
  vi.mocked(getMySubmissions).mockResolvedValue({ restaurants: [], teudot: [], reports: [{
    id: 'r', restaurantName: 'Cafe', description: 'Wrong phone', status, rejectionReason: null,
    createdAt: '2026-10-13T00:00:00Z', correctionApplied, points,
  }] });
  container = document.createElement('div'); root = createRoot(container);
  await act(async () => { root.render(<SubmissionsPanel />); });
  const { default: i18n } = await import('../i18n');
  expect(container.textContent).toContain(i18n.t(expected));
  expect(container.textContent).toContain(i18n.t('forms.submissionsLimit'));
  expect(container.textContent).not.toContain(i18n.t(expected === 'forms.correctionApplied' ? 'forms.closedWithoutChange' : 'forms.correctionApplied'));
  expect(container.textContent?.includes(i18n.t('forms.pointsEarned', { count: points }))).toBe(points > 0);
});
