const { hashPassword, comparePassword } = require('../utils/password.util');

describe('Password Utility', () => {
  const password = 'mySecretPassword123';

  test('should hash a password successfully', async () => {
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });

  test('should return true for a correct password', async () => {
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);
    expect(result).toBe(true);
  });

  test('should return false for an incorrect password', async () => {
    const hash = await hashPassword(password);
    const result = await comparePassword('wrongPassword', hash);
    expect(result).toBe(false);
  });
});
