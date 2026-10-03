import pool from '../config/db.js';

export async function createNotification(notificationData, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO notifications (user_id, title, message, is_read)
     VALUES (?, ?, ?, ?)` ,
    [notificationData.user_id, notificationData.title, notificationData.message, notificationData.is_read ?? false]
  );

  return result.insertId;
}
