import pool from '../config/db.js';

export async function getOverviewAnalytics(connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      COUNT(*) AS total_donations,
      SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_donations,
      SUM(CASE WHEN status = 'CLAIMED' THEN 1 ELSE 0 END) AS claimed_donations,
      SUM(CASE WHEN status = 'PICKUP_ASSIGNED' THEN 1 ELSE 0 END) AS assigned_donations,
      SUM(CASE WHEN status = 'PICKED_UP' THEN 1 ELSE 0 END) AS picked_up_donations,
      SUM(CASE WHEN status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP') THEN 1 ELSE 0 END) AS active_donations,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_donations,
      SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) AS expired_donations,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_donations,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals ELSE 0 END), 0) AS total_meals_saved,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals * 2.5 ELSE 0 END), 0) AS total_co2_offset
    FROM donations
  `);

  return rows[0] || null;
}

export async function getMonthlyAnalytics(connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      DATE_FORMAT(created_at, '%Y-%m-01') AS month_start,
      DATE_FORMAT(created_at, '%b %Y') AS month_name,
      COUNT(*) AS donations,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals ELSE 0 END), 0) AS meals,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS deliveries
    FROM donations
    GROUP BY DATE_FORMAT(created_at, '%Y-%m-01'), DATE_FORMAT(created_at, '%b %Y')
    ORDER BY month_start ASC
  `);

  return rows;
}

export async function getCategoryAnalytics(connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      food_category,
      COUNT(*) AS donation_count,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals ELSE 0 END), 0) AS meals_saved
    FROM donations
    GROUP BY food_category
    ORDER BY donation_count DESC, meals_saved DESC, food_category ASC
  `);

  return rows;
}

export async function getStatusAnalytics(connection = pool) {
  const [rows] = await connection.query(`
    SELECT status, COUNT(*) AS count
    FROM donations
    GROUP BY status
    ORDER BY FIELD(status, 'AVAILABLE', 'CLAIMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED')
  `);

  return rows;
}

export async function getDonorAnalytics(connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      u.id AS donor_id,
      u.name AS donor_name,
      u.email AS donor_email,
      u.organization_name AS organization_name,
      u.city AS city,
      COUNT(d.id) AS donation_count,
      COALESCE(SUM(CASE WHEN d.status = 'DELIVERED' THEN d.estimated_meals ELSE 0 END), 0) AS meals_saved,
      SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) AS successful_deliveries,
      COALESCE(SUM(CASE WHEN d.status = 'DELIVERED' THEN d.estimated_meals * 2.5 ELSE 0 END), 0) AS co2_offset
    FROM users u
    LEFT JOIN donations d ON d.donor_id = u.id
    WHERE u.role = 'DONOR'
    GROUP BY u.id, u.name, u.email, u.organization_name, u.city
    ORDER BY meals_saved DESC, donation_count DESC, u.name ASC
  `);

  return rows;
}

export async function getDonorAnalyticsById(donorId, connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      COUNT(*) AS total_donations,
      SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_donations,
      SUM(CASE WHEN status = 'CLAIMED' THEN 1 ELSE 0 END) AS claimed_donations,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_donations,
      SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_donations,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals ELSE 0 END), 0) AS meals_saved,
      COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN estimated_meals * 2.5 ELSE 0 END), 0) AS co2_offset
    FROM donations
    WHERE donor_id = ?
  `, [donorId]);

  return rows[0] || null;
}

export async function getNgAnalyticsByOrg(userId, connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      COUNT(DISTINCT dc.donation_id) AS donations_claimed,
      COALESCE(SUM(CASE WHEN d.status = 'DELIVERED' THEN d.estimated_meals ELSE 0 END), 0) AS meals_received,
      SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) AS successful_deliveries
    FROM donation_claims dc
    INNER JOIN donations d ON d.id = dc.donation_id
    WHERE dc.ngo_id = ?
  `, [userId]);

  return rows[0] || null;
}

export async function getLeaderboard(limit = 10, connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      u.id,
      u.name,
      u.organization_name,
      u.city,
      u.state,
      COUNT(d.id) AS total_donations,
      COALESCE(SUM(CASE WHEN d.status = 'DELIVERED' THEN d.estimated_meals ELSE 0 END), 0) AS total_meals_saved,
      SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END) AS completed_deliveries,
      ROUND(COALESCE(SUM(CASE WHEN d.status = 'DELIVERED' THEN d.estimated_meals * 2.5 ELSE 0 END), 0), 2) AS co2_offset_kg
    FROM users u
    INNER JOIN donations d ON d.donor_id = u.id
    WHERE u.role = 'DONOR'
    GROUP BY u.id, u.name, u.organization_name, u.city, u.state
    HAVING total_donations > 0
    ORDER BY total_meals_saved DESC, completed_deliveries DESC, total_donations DESC
    LIMIT ?
  `, [Number(limit) || 10]);

  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
    total_donations: Number(row.total_donations),
    total_meals_saved: Number(row.total_meals_saved),
    completed_deliveries: Number(row.completed_deliveries),
    co2_offset_kg: Number(row.co2_offset_kg)
  }));
}

export const analyticsModel = {
  getOverviewAnalytics,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getStatusAnalytics,
  getDonorAnalytics,
  getDonorAnalyticsById,
  getNgAnalyticsByOrg,
  getLeaderboard
};