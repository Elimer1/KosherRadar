// NEW (Agent 3): ensure history projection retains outcomes and user scoping.
// חדש (סוכן 3): בדיקת שדות ההיסטוריה והגבלתה למשתמש.
import { expect, it, vi } from 'vitest';
vi.mock('../src/models/Report.js', () => ({ Report: { find: vi.fn() } }));
import { Report } from '../src/models/Report.js';
import { listMyReportsRepo } from '../src/repositories/userSubmissionsRepository.js';

it('reads the newest 50 reports for the authenticated user with outcome and no private fields', async () => {
  const query = { select: vi.fn(), populate: vi.fn(), sort: vi.fn(), limit: vi.fn(), lean: vi.fn().mockResolvedValue([]) };
  for (const method of ['select', 'populate', 'sort', 'limit']) query[method].mockReturnValue(query);
  Report.find.mockReturnValue(query);
  await listMyReportsRepo('user-1');
  expect(Report.find).toHaveBeenCalledWith({ submittedBy: 'user-1' });
  expect(query.select).toHaveBeenCalledWith('description status correctionApplied rejectionReason createdAt restaurant');
  expect(query.populate).toHaveBeenCalledWith('restaurant', 'name');
  expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
  expect(query.limit).toHaveBeenCalledWith(50);
});
