import { describe, expect, it } from 'vitest';
import { buildReportPayload } from './reportApi';
import { emptyReportForm } from '../types/submissions';

describe('buildReportPayload', () => {
  it('sends a general report with only the needed fields', () => {
    const payload = buildReportPayload('rest-1', { ...emptyReportForm, description: 'Closed down' });

    expect(payload).toEqual({
      restaurantId: 'rest-1',
      teudaId: undefined,
      type: 'GENERAL',
      description: 'Closed down',
      proposedHechsher: undefined,
      proposedHechsherOther: undefined,
      proposedKashrutLevel: undefined,
    });
  });

  it('includes the proposed values only for a kashrut update', () => {
    const form = {
      ...emptyReportForm,
      type: 'KASHRUT_UPDATE',
      teudaId: 'teuda-1',
      description: 'They switched supervision',
      proposedHechsher: 'BADATZ_MACHPUD',
      proposedKashrutLevel: 'MEHADRIN',
    };

    const update = buildReportPayload('rest-1', form);
    expect(update.teudaId).toBe('teuda-1');
    expect(update.proposedHechsher).toBe('BADATZ_MACHPUD');
    expect(update.proposedKashrutLevel).toBe('MEHADRIN');

    const general = buildReportPayload('rest-1', { ...form, type: 'GENERAL' });
    expect(general.proposedHechsher).toBeUndefined();
    expect(general.proposedKashrutLevel).toBeUndefined();
  });
});
