import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Restaurant } from '../src/models/Restaurant.js';
import { Teuda } from '../src/models/Teuda.js';

const someId = () => new mongoose.Types.ObjectId();

describe('User model', () => {
  it('defaults to USER with 0 points and normalizes email', () => {
    const user = new User({ email: '  Test@Example.COM ', passwordHash: 'hash' });

    expect(user.role).toBe('USER');
    expect(user.points).toBe(0);
    expect(user.email).toBe('test@example.com');
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
