import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';
import { Report } from '../src/models/Report.js';
import { pendingReportFingerprint } from '../src/utils/reportIdentity.js';

const someId = () => new mongoose.Types.ObjectId();

describe('User model', () => {
  it('defaults to USER with 0 points and normalizes email', () => {
    const user = new User({ email: '  Test@Example.COM ', passwordHash: 'hash' });

    expect(user.role).toBe('USER');
    expect(user.points).toBe(0);
    expect(user.tokenVersion).toBe(0);
    expect(user.email).toBe('test@example.com');
    const source = readFileSync(new URL('../src/models/User.js', import.meta.url), 'utf8');
    expect(source.match(/tokenVersion:/g)).toHaveLength(1);
  });

  it('does not allow a made-up role', async () => {
    const user = new User({ email: 'a@example.com', passwordHash: 'hash', role: 'SUPERUSER' });

    await expect(user.validate()).rejects.toThrow();
  });

  it('hides passwordHash by default in queries', () => {
    expect(User.schema.path('passwordHash').options.select).toBe(false);
  });
});

describe('Restaurant model', () => {
  const validData = () => ({
    name: 'Test Cafe',
    address: '1 Main St, Jerusalem',
    latitude: 31.78,
    longitude: 35.22,
    foodType: 'DAIRY',
    submittedBy: someId(),
  });

  it('is PENDING by default and builds a GeoJSON point as [longitude, latitude]', async () => {
    const restaurant = new Restaurant(validData());
    await restaurant.validate();

    expect(restaurant.status).toBe('PENDING');
    expect(restaurant.location.coordinates).toEqual([35.22, 31.78]);
  });

  it('has no location at all when coordinates are not given (nothing is invented)', async () => {
    const { latitude, longitude, ...withoutCoordinates } = validData();
    const restaurant = new Restaurant(withoutCoordinates);
    await restaurant.validate();

    expect(restaurant.location).toBeUndefined();
    expect(restaurant.toObject().location).toBeUndefined();
  });

  it('keeps one pending submission per user, normalized name, address and city', () => {
    const pendingIdentity = Restaurant.schema.indexes().find(([, options]) => options.name === 'pending_submitter_name_address_city');

    expect(pendingIdentity[0]).toEqual({
      submittedBy: 1,
      nameNormalized: 1,
      addressNormalized: 1,
      cityNormalized: 1,
    });
    expect(pendingIdentity[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { status: 'PENDING', cityNormalized: { $type: 'string' } },
    });
  });

  it('stores normalized copies of name, address and phone for the duplicate check', async () => {
    const restaurant = new Restaurant({
      ...validData(),
      name: "  Joe's CAFE ",
      city: '  Tel-Aviv!  ',
      phone: '+972-50-123-4567',
    });
    await restaurant.validate();

    expect(restaurant.nameNormalized).toBe('joes cafe');
    expect(restaurant.addressNormalized).toBe('1 main st jerusalem');
    expect(restaurant.phoneNormalized).toBe('0501234567');
    expect(restaurant.cityNormalized).toBe('telaviv');
  });

  it('only accepts known hechsher values as a claim', async () => {
    const restaurant = new Restaurant({ ...validData(), claimedHechsher: 'MADE_UP' });

    await expect(restaurant.validate()).rejects.toThrow(/claimedHechsher/);
  });

  it('requires a rejection reason when REJECTED', async () => {
    const restaurant = new Restaurant({ ...validData(), status: 'REJECTED' });

    await expect(restaurant.validate()).rejects.toThrow(/rejectionReason/);
  });

  it('accepts REJECTED with a reason', async () => {
    const restaurant = new Restaurant({
      ...validData(),
      status: 'REJECTED',
      rejectionReason: 'Duplicate of an existing listing',
    });

    await expect(restaurant.validate()).resolves.toBeUndefined();
  });
});

describe('Teuda model', () => {
  it('keeps one pending dated certificate per user, restaurant, hechsher, and date', () => {
    const datedIdentity = Teuda.schema
      .indexes()
      .find(([, options]) => options.name === 'pending_dated_certificate_identity');

    expect(datedIdentity[0]).toEqual({
      restaurant: 1,
      submittedBy: 1,
      hechsher: 1,
      hechsherOther: 1,
      kashrutLevel: 1,
      expirationDate: 1,
    });
    expect(datedIdentity[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { status: 'PENDING', expirationDate: { $type: 'date' } },
    });
    expect(datedIdentity[0]).not.toHaveProperty('mashgiachName');

    const undatedIdentity = Teuda.schema
      .indexes()
      .find(([, options]) => options.name === 'pending_undated_certificate_identity');

    expect(undatedIdentity[0]).toEqual({
      restaurant: 1,
      submittedBy: 1,
      hechsher: 1,
      hechsherOther: 1,
      kashrutLevel: 1,
      mashgiachName: 1,
      mashgiachPhone: 1,
      photoFingerprint: 1,
    });
    expect(undatedIdentity[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { status: 'PENDING', expirationDate: null },
    });
  });

  it('requires a rejection reason when REJECTED', async () => {
    const teuda = new Teuda({
      restaurant: someId(),
      hechsher: 'OTHER',
      hechsherOther: 'Local Rabbi',
      kashrutLevel: 'RABBANUT',
      expirationDate: new Date('2027-01-01T00:00:00.000Z'),
      photoUrl: 'https://example.com/photo.jpg',
      cloudinaryPublicId: 'abc',
      mashgiachName: 'Name',
      mashgiachPhone: '050-0000000',
      submittedBy: someId(),
      status: 'REJECTED',
    });

    await expect(teuda.validate()).rejects.toThrow(/rejectionReason/);
  });
});

describe('Report model', () => {
  it('stores a short pending identity and does not index the description', async () => {
    const pendingIdentity = Report.schema.indexes().find(([, options]) => options.name === 'pending_report_identity');

    expect(pendingIdentity[0]).toEqual({
      submittedBy: 1,
      restaurant: 1,
      pendingReportFingerprint: 1,
    });
    expect(pendingIdentity[1]).toMatchObject({
      unique: true,
      partialFilterExpression: { status: 'PENDING', pendingReportFingerprint: { $type: 'string' } },
    });
    expect(Report.schema.path('pendingReportFingerprint').options.select).toBe(false);

    const teudaId = someId();
    const report = new Report({
      restaurant: someId(),
      submittedBy: someId(),
      teuda: teudaId,
      description: '  The hours are wrong  ',
      type: 'KASHRUT_UPDATE',
      proposedKashrutLevel: 'MEHADRIN',
    });

    await report.validate();

    expect(report.description).toBe('The hours are wrong');
    expect(report.pendingReportFingerprint).toBe(
      pendingReportFingerprint({ description: 'The hours are wrong', teuda: teudaId })
    );
    expect(report.pendingReportFingerprint).toHaveLength(64);
    expect(pendingReportFingerprint({ description: 'The hours are wrong', teuda: teudaId })).not.toBe(
      pendingReportFingerprint({ description: 'the hours are wrong', teuda: teudaId })
    );
    expect(pendingReportFingerprint({ description: 'The hours are wrong', teuda: teudaId })).not.toBe(
      pendingReportFingerprint({ description: 'The hours are wrong' })
    );
  });
});
