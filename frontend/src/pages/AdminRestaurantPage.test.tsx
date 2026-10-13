// NEW (UIAUD-001): real routed forms and API payload builders with intercepted HTTP methods.
// חדש (UIAUD-001): טפסים וניתוב אמיתיים עם יירוט בקשות ללא מסד נתונים.
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import i18n from '../i18n';
import { api } from '../api/axiosInstance';
import type { AdminRestaurantDetails } from '../types/admin';
import AdminRestaurantPage from './AdminRestaurantPage';
import AdminAddTeudaPage from './AdminAddTeudaPage';

vi.mock('../hooks/useFormOptions', () => ({ useFormOptions: () => ({ options: {
  hechsherOptions: [{ value: 'LOCAL_RABBANUT', labelEn: 'Local', labelHe: 'מקומי' }],
  hechsherOtherValue: 'OTHER', kashrutLevels: ['RABBANUT'], foodTypes: ['DAIRY'],
  categories: ['CAFE'], maxImageBytes: 5_000_000,
}, error: '' }) }));
vi.mock('../utils/imageCheck', () => ({ checkPhotoFile: vi.fn().mockResolvedValue('') }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function sample(id: string, status: 'PENDING' | 'APPROVED' = 'APPROVED'): AdminRestaurantDetails {
  return {
    restaurant: {
      id, name: `Cafe ${id}`, nameHe: null, nameEn: `English ${id}`, address: `Street ${id}`,
      addressHe: null, addressEn: null, city: 'City', latitude: 32, longitude: 35,
      geoapifyPlaceId: null, phone: null, website: null, foodType: 'DAIRY', categories: ['CAFE'],
      foodKeywords: ['coffee'], claimedHechsher: null, claimedHechsherOther: null,
      claimedKashrutLevel: null, status, submittedBy: null, adminNote: `Note ${id}`,
      rejectionReason: null, kosharotUrl: null, possibleDuplicates: [], createdAt: '2026-10-13',
    },
    teudot: [{
      id: `cert-${id}`, restaurant: { id, name: `Cafe ${id}`, address: `Street ${id}`, city: 'City', status },
      hechsher: 'LOCAL_RABBANUT', hechsherOther: null, kashrutLevel: 'RABBANUT',
      expirationDate: '2027-01-01', visibility: 'VALID', photoUrl: null,
      mashgiachName: 'Supervisor', mashgiachPhone: null, status: 'PENDING', submittedBy: null,
      submittedWithNewRestaurant: false, adminNote: `Certificate ${id}`, rejectionReason: null,
      createdAt: '2026-10-13', conflicts: [],
    }],
    publicKashrutPreview: null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

let root: Root;
let container: HTMLDivElement;
const get = vi.spyOn(api, 'get');
const put = vi.spyOn(api, 'put');
const post = vi.spyOn(api, 'post');
const remove = vi.spyOn(api, 'delete');

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage('en');
  get.mockImplementation(async (url) => ({ data: sample(url!.split('/').at(-1)!) }));
  put.mockResolvedValue({ data: { restaurant: sample('A').restaurant, teuda: sample('A').teudot[0] } });
  post.mockResolvedValue({ data: { restaurant: sample('A').restaurant, teuda: sample('A').teudot[0],
    emailStatus: 'NOT_CONFIGURED', conflictWarning: [], points: { awarded: false, points: 0, reason: 'ADMIN' } } });
  remove.mockResolvedValue({ data: { deleted: true } });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.mocked(window.confirm).mockRestore();
});

async function show(add = false, strict = false) {
  const suffix = add ? '/add-teuda' : '';
  const router = createMemoryRouter([
    { path: `/admin/restaurants/:restaurantId${suffix}`, element: add ? <AdminAddTeudaPage /> : <AdminRestaurantPage /> },
    { path: '/admin', element: <p>Dashboard</p> },
  ], { initialEntries: [`/admin/restaurants/A${suffix}`] });
  await act(async () => { root.render(strict ? <StrictMode><RouterProvider router={router} /></StrictMode> : <RouterProvider router={router} />); });
  return router;
}
function button(key: string, scope: ParentNode = container) {
  const found = [...scope.querySelectorAll<HTMLButtonElement>('button')].find((item) => item.textContent === i18n.t(key));
  expect(found, key).toBeDefined();
  return found!;
}
async function click(key: string, scope: ParentNode = container) {
  await act(async () => { button(key, scope).click(); });
}
async function submit(form: HTMLFormElement) {
  await act(async () => { form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
}
function input(selector: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
  const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('immediately discards A during delayed B load; Save attempts cannot send A to B', async () => {
  const router = await show();
  const oldForm = container.querySelector('form')!;
  const oldDelete = button('desk.deleteRestaurant');
  const b = deferred<{ data: AdminRestaurantDetails }>();
  get.mockReturnValueOnce(b.promise);
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  expect(container.textContent).toContain(i18n.t('common.loading'));
  expect(container.querySelector('form')).toBeNull();
  await submit(oldForm);
  await act(async () => { oldDelete.click(); });
  expect(put).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  await act(async () => { b.resolve({ data: sample('B') }); });
  await submit(container.querySelector('form')!);
  expect(put).toHaveBeenCalledExactlyOnceWith('/admin/restaurants/B', {
    restaurant: expect.objectContaining({ name: 'Cafe B', address: 'Street B', categories: ['CAFE'] }),
    extras: expect.objectContaining({ nameEn: 'English B', adminNote: 'Note B' }),
  });
});

it.each(['success', 'failure'])('ignores out-of-order A %s after B has loaded, even if abort is ignored', async (outcome) => {
  const a = deferred<{ data: AdminRestaurantDetails }>();
  get.mockReturnValueOnce(a.promise);
  const router = await show();
  const signal = get.mock.calls[0][1]?.signal;
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    if (outcome === 'success') a.resolve({ data: sample('A') });
    else a.reject(new Error('old A failure'));
  });
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Cafe B');
  expect(container.textContent).not.toContain('old A failure');
  await submit(container.querySelector('form')!);
  expect(put.mock.calls[0][0]).toBe('/admin/restaurants/B');
  expect(put.mock.calls[0][1]).toMatchObject({ restaurant: { name: 'Cafe B' } });
});

it('failed B loading leaves no A actions and a later navigation recovers', async () => {
  const router = await show();
  get.mockRejectedValueOnce(new Error('B unavailable'));
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  expect(container.querySelector('form')).toBeNull();
  expect(container.querySelector('button')).toBeNull();
  expect(container.textContent).not.toContain('Cafe A');
  expect(put).not.toHaveBeenCalled();
  await act(async () => { await router.navigate('/admin/restaurants/C'); });
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Cafe C');
});

it('rejects a response whose record identity differs from the requested route', async () => {
  get.mockResolvedValueOnce({ data: sample('B') });
  await show();
  expect(container.querySelector('form')).toBeNull();
  expect(put).not.toHaveBeenCalled();
});

it('back navigation creates a fresh A lifetime and ignores the first A response', async () => {
  const oldA = deferred<{ data: AdminRestaurantDetails }>();
  get.mockReturnValueOnce(oldA.promise);
  const router = await show();
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  await act(async () => { await router.navigate(-1); });
  input('#restaurant-name', 'Fresh A draft');
  await act(async () => { oldA.resolve({ data: sample('A') }); });
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Fresh A draft');
  await submit(container.querySelector('form')!);
  expect(put.mock.calls[0][1]).toMatchObject({ restaurant: { name: 'Fresh A draft' } });
});

it('language reload invalidates older reads for the same restaurant', async () => {
  const first = deferred<{ data: AdminRestaurantDetails }>();
  get.mockReturnValueOnce(first.promise);
  await show();
  await act(async () => { await i18n.changeLanguage('he'); });
  expect(get.mock.calls[0][1]?.signal?.aborted).toBe(true);
  input('#restaurant-name', 'Current draft');
  await act(async () => { first.resolve({ data: sample('A') }); });
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Current draft');
});

it('duplicate submit events cannot start concurrent saves', async () => {
  await show();
  const saving = deferred<unknown>();
  put.mockReturnValueOnce(saving.promise);
  const form = container.querySelector('form')!;
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(put).toHaveBeenCalledTimes(1);
  await act(async () => { saving.resolve({ data: { restaurant: sample('A').restaurant } }); });
});

it.each(['success', 'failure'])('navigation during Save isolates its target, payload and late %s', async (outcome) => {
  const router = await show();
  input('#restaurant-name', 'Edited A');
  const saving = deferred<unknown>();
  put.mockReturnValueOnce(saving.promise);
  await submit(container.querySelector('form')!);
  expect(put.mock.calls[0]).toEqual(['/admin/restaurants/A', expect.objectContaining({ restaurant: expect.objectContaining({ name: 'Edited A' }) })]);
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  input('#restaurant-name', 'Unsaved B');
  const loads = get.mock.calls.length;
  await act(async () => {
    if (outcome === 'success') saving.resolve({ data: { restaurant: sample('A').restaurant } });
    else saving.reject(new Error('late save failure'));
  });
  expect(get).toHaveBeenCalledTimes(loads);
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Unsaved B');
  expect(button('desk.saveChanges').disabled).toBe(false);
  expect(container.textContent).not.toContain(i18n.t('desk.saved'));
  await submit(container.querySelector('form')!);
  expect(put.mock.calls[1]).toEqual(['/admin/restaurants/B', expect.objectContaining({ restaurant: expect.objectContaining({ name: 'Unsaved B' }) })]);
});

it.each(['approve', 'reject', 'delete'])('restaurant %s stays bound to A and cannot alter B on completion', async (action) => {
  get.mockImplementation(async (url) => ({ data: sample(url!.split('/').at(-1)!, 'PENDING') }));
  const router = await show();
  const pending = deferred<unknown>();
  if (action === 'delete') remove.mockReturnValueOnce(pending.promise);
  else post.mockReturnValueOnce(pending.promise);
  if (action === 'reject') {
    await click('common.reject');
    input('#reject-restaurant-reason', 'Reason A');
    await submit(container.querySelector('form')!);
  } else await click(action === 'approve' ? 'desk.approveRestaurant' : 'desk.deleteRestaurant');
  const request = action === 'delete' ? remove : post;
  expect(request.mock.calls[0][0]).toBe(`/admin/restaurants/A${action === 'delete' ? '' : `/${action}`}`);
  if (action === 'reject') expect(post.mock.calls[0][1]).toEqual({ reason: 'Reason A' });
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  const loads = get.mock.calls.length;
  await act(async () => { pending.resolve({ data: { restaurant: { ...sample('A').restaurant, status: 'REJECTED' }, emailStatus: 'NOT_CONFIGURED' } }); });
  expect(router.state.location.pathname).toBe('/admin/restaurants/B');
  expect(get).toHaveBeenCalledTimes(loads);
  expect(button('desk.approveRestaurant').disabled).toBe(false);
});

it.each(['save', 'approve', 'reject', 'delete'])('certificate %s targets its loaded certificate; late completion cannot reload B', async (action) => {
  const router = await show();
  const card = container.querySelector('li')!;
  const pending = deferred<unknown>();
  if (action === 'save') put.mockReturnValueOnce(pending.promise);
  else if (action === 'delete') remove.mockReturnValueOnce(pending.promise);
  else post.mockReturnValueOnce(pending.promise);
  if (action === 'save') {
    await click('common.edit', card);
    input('#edit-teuda-note-cert-A', 'Edited certificate A');
    await submit(card.querySelector('form')!);
  } else if (action === 'reject') {
    await click('common.reject', card);
    input('#reject-card-cert-A-reason', 'Certificate reason A');
    await submit(card.querySelector('form')!);
  } else await click(action === 'approve' ? 'common.approve' : 'common.delete', card);
  const request = action === 'save' ? put : action === 'delete' ? remove : post;
  expect(request.mock.calls[0][0]).toBe(`/admin/teudot/cert-A${['save', 'delete'].includes(action) ? '' : `/${action}`}`);
  if (action === 'save') expect(put.mock.calls[0][1]).toMatchObject({ teuda: { adminNote: 'Edited certificate A', hechsher: 'LOCAL_RABBANUT' } });
  if (action === 'reject') expect(post.mock.calls[0][1]).toEqual({ reason: 'Certificate reason A' });
  await act(async () => { await router.navigate('/admin/restaurants/B'); });
  const loads = get.mock.calls.length;
  await act(async () => { pending.resolve({ data: { teuda: sample('A').teudot[0], conflictWarning: [], points: { awarded: false, points: 0, reason: 'ADMIN' }, emailStatus: 'NOT_CONFIGURED' } }); });
  expect(get).toHaveBeenCalledTimes(loads);
  expect(container.querySelector<HTMLInputElement>('#restaurant-name')!.value).toBe('Cafe B');
});

it('normal editing sends the correct ID and edited fields, including extras, in StrictMode', async () => {
  await show(false, true);
  input('#restaurant-name', 'Correct A');
  input('#restaurant-phone', '12345');
  await submit(container.querySelector('form')!);
  expect(put).toHaveBeenCalledExactlyOnceWith('/admin/restaurants/A', {
    restaurant: expect.objectContaining({ name: 'Correct A', phone: '12345', address: 'Street A' }),
    extras: expect.objectContaining({ nameEn: 'English A', adminNote: 'Note A' }),
  });
  expect(container.textContent).toContain(i18n.t('desk.saved'));
});

it('certificate creation discards old fields/photo during delayed navigation and ignores late upload completion', async () => {
  const router = await show(true);
  input('#admin-teuda-note', 'Draft A');
  const photo = container.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(photo, 'files', { configurable: true, value: [new File(['fixture'], 'test.jpg', { type: 'image/jpeg' })] });
  await act(async () => { photo.dispatchEvent(new Event('change', { bubbles: true })); });
  const oldForm = container.querySelector('form')!;
  const upload = deferred<unknown>();
  post.mockReturnValueOnce(upload.promise);
  await submit(oldForm);
  expect(post.mock.calls[0][0]).toBe('/admin/restaurants/A/teudot');
  expect(JSON.parse((post.mock.calls[0][1] as FormData).get('teuda') as string)).toMatchObject({ adminNote: 'Draft A' });
  const b = deferred<{ data: AdminRestaurantDetails }>();
  get.mockReturnValueOnce(b.promise);
  await act(async () => { await router.navigate('/admin/restaurants/B/add-teuda'); });
  await submit(oldForm);
  expect(post).toHaveBeenCalledTimes(1);
  expect(container.querySelector('form')).toBeNull();
  await act(async () => { b.resolve({ data: sample('B') }); upload.resolve({ data: { teuda: sample('A').teudot[0] } }); });
  expect(container.querySelector<HTMLTextAreaElement>('#admin-teuda-note')!.value).toBe('');
  expect(container.textContent).not.toContain('test.jpg');
  expect(container.textContent).not.toContain(i18n.t('desk.certificateAdded'));
  await submit(container.querySelector('form')!);
  expect(post).toHaveBeenCalledTimes(1);
});
