import pool from '../config/db.js';

export async function createOtpVerification({ phone, otp_code, expires_at, attempts = 0 }, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO otp_verifications (phone, otp_code, expires_at, attempts)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       otp_code = VALUES(otp_code),
       expires_at = VALUES(expires_at),
       attempts = VALUES(attempts),
       created_at = CURRENT_TIMESTAMP,
       verified_at = NULL`,
    [phone, otp_code, expires_at, attempts]
  );

  if (result && result.insertId) {
    return findOtpByPhone(phone, connection);
  }

  return findOtpByPhone(phone, connection);
}

export async function findOtpByPhone(phone, connection = pool) {
  const [rows] = await connection.query(
    `SELECT * FROM otp_verifications WHERE phone = ? ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );

  return rows[0] || null;
}

export async function updateOtpAttempts(phone, attempts, connection = pool) {
  await connection.execute('UPDATE otp_verifications SET attempts = ? WHERE phone = ?', [attempts, phone]);
  return findOtpByPhone(phone, connection);
}

export async function deleteOtpByPhone(phone, connection = pool) {
  await connection.execute('DELETE FROM otp_verifications WHERE phone = ?', [phone]);
  return true;
}

export async function deleteExpiredOtps(connection = pool) {
  await connection.execute('DELETE FROM otp_verifications WHERE expires_at < NOW()');
  return true;
}

export const otpModel = {
  createOtpVerification,
  findOtpByPhone,
  updateOtpAttempts,
  deleteOtpByPhone,
  deleteExpiredOtps
};
