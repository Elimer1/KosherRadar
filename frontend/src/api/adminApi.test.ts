// NEW (ADMINCERT-001): exercise admin certificate JSON and multipart request serialization.
// חדש (ADMINCERT-001): בדיקת בניית בקשות תעודה של מנהל ב-JSON ובטופס העלאה.
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('./axiosInstance', () => ({ api: { post: vi.fn(), put: vi.fn() } }));
import { api } from './axiosInstance';
import { buildAdminTeudaPayload, createTeudaAsAdmin, createRestaurantAsAdmin, updateTeuda } from './adminApi';
import { emptyRestaurantForm, emptyTeudaForm } from '../types/submissions';
import { emptyRestaurantExtras } from '../types/admin';

const values = { ...emptyTeudaForm, hechsher: 'LOCAL_RABBANUT', kashrutLevel: 'RABBANUT',
  expirationDate: '2027-01-01', mashgiachName: 'Dan', mashgiachPhone: '050-1234567' };
const photo = new File(['photo'], 'certificate.png', { type: 'image/png' });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.post).mockResolvedValue({ data: { teuda: { status: 'APPROVED' } } });
  vi.mocked(api.put).mockResolvedValue({ data: { teuda: { status: 'APPROVED' } } });
});

it.each(['', '   '])('omits a blank optional custom name (%j) from admin JSON', (hechsherOther) => {
  const payload = JSON.parse(JSON.stringify(buildAdminTeudaPayload({ ...values, hechsherOther }, 'Private')));
  expect(payload).not.toHaveProperty('hechsherOther');
  expect(payload).toMatchObject({ hechsher: 'LOCAL_RABBANUT', adminNote: 'Private', mashgiachName: 'Dan' });
});

it('retains trimmed OTHER names and required certificate fields', () => {
  expect(buildAdminTeudaPayload({ ...values, hechsher: 'OTHER', hechsherOther: ' Rabbi Levi ' }, '')).toMatchObject({
    hechsher: 'OTHER', hechsherOther: 'Rabbi Levi', kashrutLevel: 'RABBANUT', expirationDate: '2027-01-01',
  });
});

it('serializes the shared contract for add, initial certificate and editing requests', async () => {
  await createTeudaAsAdmin('restaurant-1', values, '', photo);
  await createRestaurantAsAdmin(emptyRestaurantForm, emptyRestaurantExtras, values, '', photo);
  await updateTeuda('certificate-1', values, '');
  for (const [url, data] of vi.mocked(api.post).mock.calls) {
    expect(url).toMatch(/^\/admin\/restaurants/);
    const form = data as FormData;
    expect(JSON.parse(form.get('teuda') as string)).not.toHaveProperty('hechsherOther');
    expect(form.get('photo')).toBe(photo);
  }
  const [url, data] = vi.mocked(api.put).mock.calls[0];
  expect(url).toBe('/admin/teudot/certificate-1');
  expect(JSON.parse(JSON.stringify(data)).teuda).not.toHaveProperty('hechsherOther');
});
