const mysql = require("mysql2/promise");

function getPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "swapuser",
    password: process.env.DB_PASSWORD || "swappass",
    database: process.env.DB_NAME || "swapcircle",
    waitForConnections: true,
    connectionLimit: 10
  });
}

module.exports = { getPool };
