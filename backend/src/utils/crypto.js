const crypto = require('crypto');

const SALT = 'justiceflow_review2_salt_2026';

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

function verifyPassword(password, hash) {
  if (!hash) return false;
  const computed = hashPassword(password);
  return computed === hash;
}

module.exports = { hashPassword, verifyPassword };

