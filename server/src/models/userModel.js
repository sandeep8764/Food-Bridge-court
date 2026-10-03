import pool from '../config/db.js';

const USER_SELECT_COLUMNS = `
  id,
  name,
  email,
  password_hash,
  phone,
  role,
  organization_name,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  profile_image,
  is_active,
  created_at,
  updated_at
`;

const PUBLIC_USER_COLUMNS = `
  id,
  name,
  email,
  phone,
  role,
  organization_name,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  profile_image,
  is_active,
  created_at,
  updated_at
`;

export async function findUserByEmail(email, connection = pool) {
  const [rows] = await connection.query(`SELECT ${USER_SELECT_COLUMNS} FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

export async function findUserById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT ${USER_SELECT_COLUMNS} FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function createUser(userData, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO users (
      name,
      email,
      password_hash,
      phone,
      role,
      organization_name,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      profile_image,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userData.name,
      userData.email,
      userData.password_hash,
      userData.phone,
      userData.role,
      userData.organization_name,
      userData.address,
      userData.city,
      userData.state,
      userData.country || 'India',
      userData.latitude ?? null,
      userData.longitude ?? null,
      userData.profile_image ?? null,
      userData.is_active ?? true
    ]
  );

  return result.insertId;
}

export async function updateUserProfile(id, updates, connection = pool) {
  const allowedFields = ['name', 'phone', 'organization_name', 'address', 'city', 'state', 'profile_image'];
  const setClauses = [];
  const values = [];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      setClauses.push(`${field} = ?`);
      values.push(updates[field]);
    }
  });

  if (setClauses.length === 0) {
    return null;
  }

  values.push(id);
  await connection.execute(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findUserById(id, connection);
}

export async function updateUserActiveStatus(id, isActive, connection = pool) {
  await connection.execute('UPDATE users SET is_active = ? WHERE id = ?', [Boolean(isActive), id]);
  return findUserById(id, connection);
}

export async function listUsers({ page = 1, limit = 20, role, is_active, search } = {}, connection = pool) {
  const conditions = [];
  const values = [];
  const offset = (page - 1) * limit;

  if (role) {
    conditions.push('role = ?');
    values.push(role);
  }

  if (is_active !== undefined && is_active !== null && is_active !== '') {
    conditions.push('is_active = ?');
    values.push(is_active === 'true' || is_active === true || is_active === 1 || is_active === '1');
  }

  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR organization_name LIKE ? OR phone LIKE ? OR city LIKE ?)');
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await connection.query(`SELECT COUNT(*) AS total FROM users ${whereClause}`, values);
  const [rows] = await connection.query(
    `SELECT ${PUBLIC_USER_COLUMNS} FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    }
  };
}

export async function getUserRoleCounts(connection = pool) {
  const [rows] = await connection.query(`
    SELECT
      COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'DONOR' THEN 1 ELSE 0 END) AS total_donors,
      SUM(CASE WHEN role = 'NGO' THEN 1 ELSE 0 END) AS total_ngos,
      SUM(CASE WHEN role = 'SHELTER' THEN 1 ELSE 0 END) AS total_shelters,
      SUM(CASE WHEN role = 'VOLUNTEER' THEN 1 ELSE 0 END) AS total_volunteers,
      SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS total_admins,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_users,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_users
    FROM users
  `);

  return rows[0] || {
    total_users: 0,
    total_donors: 0,
    total_ngos: 0,
    total_shelters: 0,
    total_volunteers: 0,
    total_admins: 0,
    active_users: 0,
    inactive_users: 0
  };
}

export async function getUserRoleDistribution(connection = pool) {
  const [rows] = await connection.query(`
    SELECT role, COUNT(*) AS count
    FROM users
    GROUP BY role
    ORDER BY count DESC
  `);
  return rows;
}

export const userModel = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserActiveStatus,
  listUsers,
  getUserRoleCounts,
  getUserRoleDistribution,
  PUBLIC_USER_COLUMNS
};
