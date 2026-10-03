import pool from '../config/db.js';

const DONATION_SELECT_COLUMNS = `
  d.id,
  d.donor_id,
  d.food_name,
  d.food_category,
  d.description,
  d.quantity,
  d.quantity_unit,
  d.estimated_meals,
  d.preparation_time,
  d.expiry_time,
  d.pickup_start_time,
  d.pickup_end_time,
  d.address,
  d.city,
  d.state,
  d.latitude,
  d.longitude,
  d.status,
  d.image_url,
  d.created_at,
  d.updated_at
`;

export async function createDonation(donationData, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO donations (
      donor_id,
      food_name,
      food_category,
      description,
      quantity,
      quantity_unit,
      estimated_meals,
      preparation_time,
      expiry_time,
      pickup_start_time,
      pickup_end_time,
      address,
      city,
      state,
      latitude,
      longitude,
      status,
      image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      donationData.donor_id,
      donationData.food_name,
      donationData.food_category,
      donationData.description ?? null,
      donationData.quantity,
      donationData.quantity_unit,
      donationData.estimated_meals,
      donationData.preparation_time ?? null,
      donationData.expiry_time,
      donationData.pickup_start_time ?? null,
      donationData.pickup_end_time ?? null,
      donationData.address,
      donationData.city ?? null,
      donationData.state ?? null,
      donationData.latitude,
      donationData.longitude,
      donationData.status ?? 'AVAILABLE',
      donationData.image_url ?? null
    ]
  );

  return result.insertId;
}

export async function findDonationById(id, connection = pool) {
  const [rows] = await connection.query(`SELECT ${DONATION_SELECT_COLUMNS} FROM donations d WHERE d.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function findDonationDetailsById(id, connection = pool) {
  const [rows] = await connection.query(
    `SELECT
      d.id,
      d.donor_id,
      d.food_name,
      d.food_category,
      d.description,
      d.quantity,
      d.quantity_unit,
      d.estimated_meals,
      d.preparation_time,
      d.expiry_time,
      d.pickup_start_time,
      d.pickup_end_time,
      d.address,
      d.city,
      d.state,
      d.latitude,
      d.longitude,
      d.status,
      d.image_url,
      d.created_at,
      d.updated_at,
      u.id AS donor_id_user,
      u.name AS donor_name,
      u.email AS donor_email,
      u.phone AS donor_phone,
      u.organization_name AS donor_organization_name,
      u.city AS donor_city,
      u.state AS donor_state,
      dc.id AS claim_id,
      dc.ngo_id,
      dc.claimed_at,
      dc.status AS claim_status,
      ngo.name AS ngo_name,
      ngo.organization_name AS ngo_organization_name,
      ngo.phone AS ngo_phone,
      vt.id AS task_id,
      vt.volunteer_id,
      vt.status AS task_status,
      vol.name AS volunteer_name,
      vol.phone AS volunteer_phone
    FROM donations d
    INNER JOIN users u ON u.id = d.donor_id
    LEFT JOIN donation_claims dc ON dc.donation_id = d.id AND dc.status = 'ACTIVE'
    LEFT JOIN users ngo ON ngo.id = dc.ngo_id
    LEFT JOIN volunteer_tasks vt ON vt.donation_id = d.id
    LEFT JOIN users vol ON vol.id = vt.volunteer_id
    WHERE d.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function findDonationWithOwner(id, connection = pool) {
  const [rows] = await connection.query(
    `SELECT
      d.*,
      u.id AS owner_id,
      u.name AS owner_name,
      u.email AS owner_email,
      u.organization_name AS owner_organization_name,
      u.role AS owner_role
    FROM donations d
    INNER JOIN users u ON u.id = d.donor_id
    WHERE d.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function updateDonation(id, updates, connection = pool) {
  const allowedFields = [
    'food_name',
    'food_category',
    'description',
    'quantity',
    'quantity_unit',
    'estimated_meals',
    'preparation_time',
    'expiry_time',
    'pickup_start_time',
    'pickup_end_time',
    'address',
    'city',
    'state',
    'latitude',
    'longitude',
    'image_url',
    'status'
  ];

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
  await connection.execute(`UPDATE donations SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findDonationById(id, connection);
}

export async function cancelDonation(id, connection = pool) {
  await connection.execute('UPDATE donations SET status = ? WHERE id = ?', ['CANCELLED', id]);
  return findDonationById(id, connection);
}

export async function createDonationClaim({ donation_id, ngo_id }, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO donation_claims (donation_id, ngo_id, claimed_at, status)
     VALUES (?, ?, NOW(), 'ACTIVE')`,
    [donation_id, ngo_id]
  );
  return result.insertId;
}

export async function findClaimByDonationId(donationId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT * FROM donation_claims WHERE donation_id = ? AND status = 'ACTIVE' LIMIT 1`,
    [donationId]
  );
  return rows[0] || null;
}

export async function listClaimsByNgo(ngoId, { page = 1, limit = 20 } = {}, connection = pool) {
  const offset = (page - 1) * limit;
  const [countRows] = await connection.query(
    `SELECT COUNT(*) AS total FROM donation_claims dc WHERE dc.ngo_id = ?`,
    [ngoId]
  );

  const [rows] = await connection.query(
    `SELECT
       dc.id AS claim_id,
       dc.donation_id,
       dc.ngo_id,
       dc.claimed_at,
       dc.status AS claim_status,
       d.food_name,
       d.food_category,
       d.quantity,
       d.quantity_unit,
       d.estimated_meals,
       d.expiry_time,
       d.address,
       d.city,
       d.state,
       d.status AS donation_status,
       u.name AS donor_name,
       u.organization_name AS donor_organization_name,
       vt.id AS task_id,
       vt.volunteer_id,
       vt.status AS task_status,
       vol.name AS volunteer_name
     FROM donation_claims dc
     INNER JOIN donations d ON d.id = dc.donation_id
     INNER JOIN users u ON u.id = d.donor_id
     LEFT JOIN volunteer_tasks vt ON vt.donation_id = d.id
     LEFT JOIN users vol ON vol.id = vt.volunteer_id
     WHERE dc.ngo_id = ?
     ORDER BY dc.claimed_at DESC
     LIMIT ? OFFSET ?`,
    [ngoId, limit, offset]
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

export async function listDonations(filters = {}, connection = pool) {
  const conditions = [];
  const values = [];
  const page = Math.max(Number.parseInt(filters.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(filters.limit || '20', 10), 1), 100);
  const offset = (page - 1) * limit;

  if (filters.status) {
    conditions.push('d.status = ?');
    values.push(filters.status);
  }

  if (filters.category) {
    conditions.push('d.food_category = ?');
    values.push(filters.category);
  }

  if (filters.city) {
    conditions.push('d.city = ?');
    values.push(filters.city);
  }

  if (filters.search) {
    conditions.push('(d.food_name LIKE ? OR d.description LIKE ? OR d.address LIKE ? OR u.name LIKE ? OR u.organization_name LIKE ?)');
    const searchValue = `%${filters.search}%`;
    values.push(searchValue, searchValue, searchValue, searchValue, searchValue);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await connection.query(
    `SELECT COUNT(*) AS total FROM donations d LEFT JOIN users u ON u.id = d.donor_id ${whereClause}`,
    values
  );

  const [rows] = await connection.query(
    `SELECT
       ${DONATION_SELECT_COLUMNS},
       u.name AS donor_name,
       u.organization_name AS donor_organization_name,
       u.email AS donor_email
     FROM donations d
     LEFT JOIN users u ON u.id = d.donor_id
     ${whereClause}
     ORDER BY d.created_at DESC
     LIMIT ? OFFSET ?`,
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

export async function listDonationsByDonor(donorId, filters = {}, connection = pool) {
  const conditions = ['d.donor_id = ?'];
  const values = [donorId];
  const page = Math.max(Number.parseInt(filters.page || '1', 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(filters.limit || '20', 10), 1), 100);
  const offset = (page - 1) * limit;

  if (filters.status) {
    conditions.push('d.status = ?');
    values.push(filters.status);
  }

  if (filters.category) {
    conditions.push('d.food_category = ?');
    values.push(filters.category);
  }

  if (filters.city) {
    conditions.push('d.city = ?');
    values.push(filters.city);
  }

  if (filters.search) {
    conditions.push('(d.food_name LIKE ? OR d.description LIKE ? OR d.address LIKE ?)');
    const searchValue = `%${filters.search}%`;
    values.push(searchValue, searchValue, searchValue);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [countRows] = await connection.query(`SELECT COUNT(*) AS total FROM donations d ${whereClause}`, values);
  const [rows] = await connection.query(
    `SELECT ${DONATION_SELECT_COLUMNS} FROM donations d ${whereClause} ORDER BY d.created_at DESC LIMIT ? OFFSET ?`,
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

export async function findNearbyDonations({ latitude, longitude, radiusKm = 10, page = 1, limit = 20 }, connection = pool) {
  const latitudeRadians = (Number(latitude) * Math.PI) / 180;
  const latitudeDelta = radiusKm / 111.32;
  const longitudeDelta = radiusKm / (111.32 * Math.max(Math.abs(Math.cos(latitudeRadians)), 0.000001));
  const minLatitude = Number(latitude) - latitudeDelta;
  const maxLatitude = Number(latitude) + latitudeDelta;
  const minLongitude = Number(longitude) - longitudeDelta;
  const maxLongitude = Number(longitude) + longitudeDelta;

  const distanceExpression = `(
    6371 * ACOS(LEAST(1, GREATEST(-1,
      COS(RADIANS(?)) * COS(RADIANS(d.latitude)) * COS(RADIANS(d.longitude) - RADIANS(?)) +
      SIN(RADIANS(?)) * SIN(RADIANS(d.latitude))
    )))
  )`;

  const commonConditions = `
    d.status = 'AVAILABLE'
    AND d.expiry_time > NOW()
    AND d.latitude BETWEEN ? AND ?
    AND d.longitude BETWEEN ? AND ?
    AND ${distanceExpression} <= ?
  `;

  const whereValues = [
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
    latitude,
    longitude,
    latitude,
    radiusKm
  ];

  const [countRows] = await connection.query(
    `SELECT COUNT(*) AS total FROM donations d WHERE ${commonConditions}`,
    whereValues
  );

  const [rows] = await connection.query(
    `SELECT
      ${DONATION_SELECT_COLUMNS},
      ROUND(${distanceExpression}, 2) AS distance_km,
      u.name AS donor_name,
      u.organization_name AS donor_organization_name,
      u.phone AS donor_phone
    FROM donations d
    INNER JOIN users u ON u.id = d.donor_id
    WHERE ${commonConditions}
    ORDER BY d.expiry_time ASC, distance_km ASC
    LIMIT ? OFFSET ?`,
    [...whereValues, latitude, longitude, latitude, limit, (page - 1) * limit]
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

export const donationModel = {
  createDonation,
  findDonationById,
  findDonationDetailsById,
  findDonationWithOwner,
  updateDonation,
  cancelDonation,
  createDonationClaim,
  findClaimByDonationId,
  listClaimsByNgo,
  listDonations,
  listDonationsByDonor,
  findNearbyDonations
};
