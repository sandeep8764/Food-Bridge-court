import pool from '../config/db.js';

export async function findImpactByDonationId(donationId, connection = pool) {
  const [rows] = await connection.query('SELECT * FROM impact_records WHERE donation_id = ? LIMIT 1', [donationId]);
  return rows[0] || null;
}

export async function createImpactRecord(impactData, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO impact_records (donation_id, meals_saved, co2_offset_kg, calculation_method)
     VALUES (?, ?, ?, ?)` ,
    [impactData.donation_id, impactData.meals_saved, impactData.co2_offset_kg, impactData.calculation_method]
  );

  return result.insertId;
}
