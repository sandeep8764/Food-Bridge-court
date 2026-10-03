import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'foodbridge',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

async function main() {
  const [users] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const [donations] = await pool.query('SELECT COUNT(*) AS count FROM donations');
  const [claims] = await pool.query('SELECT COUNT(*) AS count FROM donation_claims');
  const [tasks] = await pool.query('SELECT COUNT(*) AS count FROM volunteer_tasks');
  const [impactRecords] = await pool.query('SELECT COUNT(*) AS count FROM impact_records');

  console.log(`Users: ${users[0].count}`);
  console.log(`Donations: ${donations[0].count}`);
  console.log(`Claims: ${claims[0].count}`);
  console.log(`Volunteer Tasks: ${tasks[0].count}`);
  console.log(`Impact Records: ${impactRecords[0].count}`);

  await pool.end();
}

main().catch(async (error) => {
  console.error('Verification failed:', error.message);
  await pool.end();
  process.exit(1);
});
