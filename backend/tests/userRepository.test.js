import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/models/User.js', () => ({
  User: {
    findByIdAndUpdate: vi.fn(async () => ({ _id: 'user-1' })),
  },
}));

import { User } from '../src/models/User.js';
import { setUserPasswordHashRepo } from '../src/repositories/userRepository.js';

describe('setUserPasswordHashRepo', () => {
  it('saves the new password hash and bumps the session version in the same update', async () => {
    await setUserPasswordHashRepo('user-1', 'hashed');

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { $set: { passwordHash: 'hashed' }, $inc: { tokenVersion: 1 } },
      { new: true }
    );
  });
});
