const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "swapuser",
  password: process.env.DB_PASSWORD || "swappass",
  database: process.env.DB_NAME || "swapcircle",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

function getPool() {
  return pool;
}

async function waitForDatabase(options = {}) {
  const retries = Number(options.retries || process.env.DB_CONNECT_RETRIES || 30);
  const delayMs = Number(options.delayMs || process.env.DB_CONNECT_DELAY_MS || 2000);
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log(`Database connection established on attempt ${attempt}/${retries}`);
      return true;
    } catch (error) {
      lastError = error;
      console.log(
        `Waiting for database... attempt ${attempt}/${retries} failed: ${error.code || error.message}`
      );

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

module.exports = { pool, getPool, waitForDatabase };
