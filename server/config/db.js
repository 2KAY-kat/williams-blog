const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Load CA from env (base64) or local file
let ca;
if (process.env.DB_SSL_CA) {
  ca = Buffer.from(process.env.DB_SSL_CA, 'base64');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: ca ? { ca } : false,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
