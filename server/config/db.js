const mysql = require('mysql2/promise');
require('dotenv').config();

const ssl = process.env.DB_SSL === "true";

const sslConfig = ssl
  ? {
      ca: Buffer.from(process.env.DB_SSL_CA, "base64"),
      rejectUnauthorized: true,
    }
  : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
