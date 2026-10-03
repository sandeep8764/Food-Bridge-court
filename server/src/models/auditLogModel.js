import pool from '../config/db.js';

export async function createAuditLog({ user_id, action, entity_type, entity_id, details }, connection = pool) {
  const detailsJson = details ? JSON.stringify(details) : null;
  const [result] = await connection.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [user_id ?? null, action, entity_type ?? null, entity_id ?? null, detailsJson]
  );
  return result.insertId;
}

export async function listAuditLogs({ page = 1, limit = 20, action, entity_type, search } = {}, connection = pool) {
  const conditions = [];
  const values = [];
  const offset = (page - 1) * limit;

  if (action) {
    conditions.push('a.action = ?');
    values.push(action);
  }

  if (entity_type) {
    conditions.push('a.entity_type = ?');
    values.push(entity_type);
  }

  if (search) {
    conditions.push('(a.action LIKE ? OR a.entity_type LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${whereClause}`,
    values
  );

  const [rows] = await connection.query(
    `SELECT
       a.id,
       a.user_id,
       a.action,
       a.entity_type,
       a.entity_id,
       a.details,
       a.created_at,
       u.name AS user_name,
       u.email AS user_email,
       u.role AS user_role
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ${whereClause}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );

  return {
    data: rows.map((row) => ({
      ...row,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
    })),
    pagination: {
      page,
      limit,
      total: countRows[0].total,
      totalPages: Math.ceil(countRows[0].total / limit)
    }
  };
}

export const auditLogModel = {
  createAuditLog,
  listAuditLogs
};
