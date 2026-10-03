import pool from '../config/db.js';

const TASK_SELECT_COLUMNS = `
  id,
  donation_id,
  volunteer_id,
  claim_id,
  assigned_at,
  accepted_at,
  picked_up_at,
  delivered_at,
  status
`;

export async function createTask(taskData, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO volunteer_tasks (
      donation_id,
      volunteer_id,
      claim_id,
      assigned_at,
      status
    ) VALUES (?, ?, ?, ?, ?)`,
    [taskData.donation_id, taskData.volunteer_id, taskData.claim_id, taskData.assigned_at || new Date(), taskData.status || 'ASSIGNED']
  );

  return result.insertId;
}

export async function findTaskById(id, connection = pool) {
  const [rows] = await connection.query(
    `SELECT ${TASK_SELECT_COLUMNS} FROM volunteer_tasks WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findTaskDetailsById(id, connection = pool) {
  const [rows] = await connection.query(
    `SELECT
      t.id,
      t.donation_id,
      t.volunteer_id,
      t.claim_id,
      t.assigned_at,
      t.accepted_at,
      t.picked_up_at,
      t.delivered_at,
      t.status,
      d.food_name,
      d.food_category,
      d.quantity,
      d.quantity_unit,
      d.estimated_meals,
      d.expiry_time,
      d.address AS pickup_address,
      d.city AS pickup_city,
      d.state AS pickup_state,
      d.latitude AS pickup_latitude,
      d.longitude AS pickup_longitude,
      du.id AS donor_id,
      du.name AS donor_name,
      du.email AS donor_email,
      du.phone AS donor_phone,
      du.organization_name AS donor_organization_name,
      c.ngo_id,
      ngo.name AS ngo_name,
      ngo.email AS ngo_email,
      ngo.organization_name AS ngo_organization_name,
      ngo.phone AS ngo_phone,
      ngo.address AS ngo_address,
      ngo.city AS ngo_city,
      ngo.state AS ngo_state,
      v.name AS volunteer_name,
      v.email AS volunteer_email,
      v.phone AS volunteer_phone
    FROM volunteer_tasks t
    INNER JOIN donations d ON d.id = t.donation_id
    INNER JOIN users du ON du.id = d.donor_id
    LEFT JOIN donation_claims c ON c.id = t.claim_id
    LEFT JOIN users ngo ON ngo.id = c.ngo_id
    LEFT JOIN users v ON v.id = t.volunteer_id
    WHERE t.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function listTasksByVolunteer(volunteerId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT ${TASK_SELECT_COLUMNS} FROM volunteer_tasks WHERE volunteer_id = ? ORDER BY assigned_at DESC`,
    [volunteerId]
  );
  return rows;
}

export async function findTaskByDonationId(donationId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT ${TASK_SELECT_COLUMNS} FROM volunteer_tasks WHERE donation_id = ? LIMIT 1`,
    [donationId]
  );
  return rows[0] || null;
}

export async function assignVolunteerTask({ donationId, claimId, volunteerId }, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO volunteer_tasks (donation_id, volunteer_id, claim_id, assigned_at, status)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'ASSIGNED')`,
    [donationId, volunteerId, claimId]
  );

  return result.insertId;
}

export async function updateTaskStatus(id, updates, connection = pool) {
  const setClauses = [];
  const values = [];

  if (updates.volunteer_id !== undefined) {
    setClauses.push('volunteer_id = ?');
    values.push(updates.volunteer_id);
  }
  if (updates.accepted_at !== undefined) {
    setClauses.push('accepted_at = ?');
    values.push(updates.accepted_at);
  }
  if (updates.picked_up_at !== undefined) {
    setClauses.push('picked_up_at = ?');
    values.push(updates.picked_up_at);
  }
  if (updates.delivered_at !== undefined) {
    setClauses.push('delivered_at = ?');
    values.push(updates.delivered_at);
  }
  if (updates.status !== undefined) {
    setClauses.push('status = ?');
    values.push(updates.status);
  }

  if (setClauses.length === 0) {
    return null;
  }

  values.push(id);
  await connection.execute(`UPDATE volunteer_tasks SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findTaskById(id, connection);
}
