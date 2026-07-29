import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const password = process.env.PILOT_PASSWORD;
if (!password) process.exitCode = 1;
else {
  const salt = randomBytes(16);
  const hash = await promisify(scryptCallback)(password, salt, 64);
  console.log(`scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`);
}
