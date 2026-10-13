// NEW (Agent 3): exercise overlapping certificate validation without real uploads.
// חדש (סוכן 3): בדיקת אימות מקביל ללא העלאות אמיתיות.
import { act, useEffect, type ChangeEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { usePhotoField } from './usePhotoField';
import { checkPhotoFile } from '../utils/imageCheck';

vi.mock('../utils/imageCheck', () => ({ checkPhotoFile: vi.fn() }));
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let field: ReturnType<typeof usePhotoField>;
let root: Root;
let container: HTMLDivElement;
function Harness() {
  const result = usePhotoField(1024);
  useEffect(() => { field = result; });
  return null;
}
function mount() {
  container = document.createElement('div');
  root = createRoot(container);
  act(() => root.render(<Harness />));
}
function choose(file: File | null) {
  const target = { files: file ? [file] : [], value: file?.name || '' };
  let pending: Promise<void>;
  act(() => { pending = field.handlePhotoChange({ target } as unknown as ChangeEvent<HTMLInputElement>); });
  return pending!;
}
function deferred() {
  let resolve!: (value: string) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<string>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
afterEach(() => { act(() => root?.unmount()); container?.remove(); vi.resetAllMocks(); });

it('blocks submission while validation is pending', async () => {
  const validation = deferred();
  vi.mocked(checkPhotoFile).mockReturnValue(validation.promise as ReturnType<typeof checkPhotoFile>);
  mount();
  const pending = choose(new File(['a'], 'a.jpg'));
  expect(field.photoValidating).toBe(true);
  expect(field.getPhotoSubmissionError()).not.toBe('');
  await act(async () => { validation.resolve(''); await pending; });
  expect(field.photoValidating).toBe(false);
  expect(field.getPhotoSubmissionError()).toBe('');
});

it.each(['', 'bad-type'])('ignores obsolete A result (%s) after B succeeds', async (problem) => {
  const a = deferred(); const b = deferred();
  vi.mocked(checkPhotoFile).mockReturnValueOnce(a.promise as ReturnType<typeof checkPhotoFile>).mockReturnValueOnce(b.promise as ReturnType<typeof checkPhotoFile>);
  mount();
  const first = choose(new File(['a'], 'a.jpg'));
  const photoB = new File(['b'], 'b.jpg');
  const second = choose(photoB);
  await act(async () => { b.resolve(''); await second; });
  await act(async () => { a.resolve(problem); await first; });
  expect(field.photo).toBe(photoB);
  expect(field.photoError).toBe('');
});

it('shows read failures, blocks submission, and preserves the last valid photo', async () => {
  vi.mocked(checkPhotoFile).mockResolvedValueOnce('');
  mount();
  const valid = new File(['a'], 'valid.jpg');
  await act(async () => { await choose(valid); });
  vi.mocked(checkPhotoFile).mockRejectedValueOnce(new Error('read failed'));
  await act(async () => { await choose(new File(['b'], 'broken.jpg')); });
  expect(field.photo).toBe(valid);
  expect(field.photoError).not.toBe('');
  expect(field.getPhotoSubmissionError()).not.toBe('');
  expect(field.photoValidating).toBe(false);
});

it('clearing during validation prevents the result from restoring the photo', async () => {
  const validation = deferred();
  vi.mocked(checkPhotoFile).mockReturnValue(validation.promise as ReturnType<typeof checkPhotoFile>);
  mount();
  const pending = choose(new File(['a'], 'a.jpg'));
  act(() => { field.clearPhoto(); });
  await act(async () => { validation.resolve(''); await pending; });
  expect(field.photo).toBeNull();
  expect(field.photoValidating).toBe(false);
  expect(field.getPhotoSubmissionError()).toBe('');
});

it('ignores a read rejection from an obsolete selection while B remains pending', async () => {
  const a = deferred(); const b = deferred();
  vi.mocked(checkPhotoFile).mockReturnValueOnce(a.promise as ReturnType<typeof checkPhotoFile>).mockReturnValueOnce(b.promise as ReturnType<typeof checkPhotoFile>);
  mount();
  const first = choose(new File(['a'], 'a.jpg'));
  const photoB = new File(['b'], 'b.jpg');
  const second = choose(photoB);
  await act(async () => { a.reject(new Error('old read failed')); await first; });
  expect(field.photoValidating).toBe(true);
  expect(field.photoError).toBe('');
  await act(async () => { b.resolve(''); await second; });
  expect(field.photo).toBe(photoB);
});

it('keeps the last valid photo after invalid replacement and recovers when cleared', async () => {
  vi.mocked(checkPhotoFile).mockResolvedValueOnce('').mockResolvedValueOnce('bad-type');
  mount();
  const valid = new File(['a'], 'valid.jpg');
  await act(async () => { await choose(valid); });
  await act(async () => { await choose(new File(['bad'], 'fake.jpg')); });
  expect(field.photo).toBe(valid);
  expect(field.getPhotoSubmissionError()).not.toBe('');
  await act(async () => { await choose(null); });
  expect(field.photo).toBeNull();
  expect(field.getPhotoSubmissionError()).toBe('');
});
