const mysql = require("mysql2/promise");
require("dotenv").config();

// Build SSL configuration based on environment variables
const sslConfig = process.env.DB_SSL_CA
  ? {
      ca: Buffer.from(process.env.DB_SSL_CA, "base64").toString(),
      rejectUnauthorized: false, // REQUIRED for Aiven CA
    }
  : process.env.DB_HOST && process.env.DB_HOST.includes("aivencloud.com")
  ? { rejectUnauthorized: false } // SSL enabled but without custom CA for Aiven
  : undefined; // No SSL for local development

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
