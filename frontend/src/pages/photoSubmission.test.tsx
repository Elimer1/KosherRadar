// NEW (Agent 3): pending photo validation must prevent every consuming form from sending.
// חדש (סוכן 3): מניעת שליחה מכל הטפסים בזמן אימות תמונה.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import SubmitRestaurantPage from './SubmitRestaurantPage';
import SubmitTeudaPage from './SubmitTeudaPage';
import SubmitReportPage from './SubmitReportPage';
import AdminAddTeudaPage from './AdminAddTeudaPage';
import AdminCreateRestaurantPage from './AdminCreateRestaurantPage';
import { checkPhotoFile } from '../utils/imageCheck';
import { submitRestaurant, submitTeuda } from '../api/restaurantApi';
import { submitReport } from '../api/reportApi';
import { createRestaurantAsAdmin, createTeudaAsAdmin } from '../api/adminApi';

vi.mock('../utils/imageCheck', () => ({ checkPhotoFile: vi.fn() }));
vi.mock('../hooks/useFormOptions', () => ({ useFormOptions: () => ({ options: {
  maxImageBytes: 1024, hechsherOtherValue: 'OTHER',
  hechsherOptions: [{ value: 'LOCAL_RABBINATE', labelEn: 'Local', labelHe: 'מקומי' }],
  kashrutLevels: [], foodTypes: [], categories: ['CAFE'],
}, error: '' }) }));
vi.mock('../components/RestaurantFields', () => ({ default: ({ onChange, onToggleCategory }: {
  onChange: (field: string, value: string) => void; onToggleCategory: (value: string) => void;
}) => <button type="button" data-fill onClick={() => {
  onChange('name', 'Cafe'); onChange('address', 'Street'); onChange('city', 'City'); onToggleCategory('CAFE');
}}>Fill restaurant</button> }));
vi.mock('../api/restaurantApi', async (original) => ({
  ...await original<object>(), submitRestaurant: vi.fn(), submitTeuda: vi.fn(),
  getSubmissionContext: vi.fn().mockResolvedValue({ restaurant: { id: 'r', name: 'Cafe', address: 'Street' }, teudot: [] }),
}));
vi.mock('../api/reportApi', () => ({ submitReport: vi.fn() }));
vi.mock('../api/adminApi', () => ({ createRestaurantAsAdmin: vi.fn(), createTeudaAsAdmin: vi.fn(),
  getRestaurantDetails: vi.fn().mockResolvedValue({ restaurant: { id: 'r', name: 'Cafe' } }),
}));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
afterEach(() => { act(() => root?.unmount()); container?.remove(); vi.clearAllMocks(); });
const cases = [SubmitRestaurantPage, SubmitTeudaPage, SubmitReportPage, AdminAddTeudaPage, AdminCreateRestaurantPage];
it.each(cases)('%s prevents pending submission and resumes with the validated file', async (Page) => {
  let resolve!: (value: '') => void;
  vi.mocked(checkPhotoFile).mockReturnValue(new Promise<''>((yes) => { resolve = yes; }));
  vi.mocked(submitRestaurant).mockResolvedValue({ restaurant: { id: 'r', status: 'PENDING' }, teuda: { id: 't', status: 'PENDING' }, possibleDuplicateCount: 0, locationStatus: 'selected' });
  container = document.createElement('div'); root = createRoot(container);
  await act(async () => { root.render(<MemoryRouter initialEntries={['/r']}><Routes><Route path="/:restaurantId" element={<Page />} /></Routes></MemoryRouter>); });
  act(() => { container.querySelector<HTMLButtonElement>('[data-fill]')?.click(); });
  // Enable the optional admin certificate and fill the public fields through React events.
  act(() => { container.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click(); });
  const hechsher = container.querySelector<HTMLSelectElement>('select');
  if (hechsher) act(() => { hechsher.value = 'LOCAL_RABBINATE'; hechsher.dispatchEvent(new Event('change', { bubbles: true })); });
  const note = container.querySelector<HTMLTextAreaElement>('#report-description');
  if (note) act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(note, 'Wrong phone');
    note.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const file = new File(['photo'], 'certificate.jpg');
  Object.defineProperty(input, 'files', { configurable: true, value: [file] });
  act(() => { input.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
  await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  for (const send of [submitRestaurant, submitTeuda, submitReport, createRestaurantAsAdmin, createTeudaAsAdmin]) expect(send).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Checking the photo');
  await act(async () => { resolve(''); });
  expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  await act(async () => { container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
  const send = [submitRestaurant, submitTeuda, submitReport, createTeudaAsAdmin, createRestaurantAsAdmin][cases.indexOf(Page)];
  expect(send).toHaveBeenCalledOnce();
  expect(vi.mocked(send).mock.calls[0]).toContain(file);
});
