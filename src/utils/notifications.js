const { pool } = require("../db");

async function addNotification(userId, body, link) {
  if (!userId || !body) return;
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, body, link) VALUES (?, ?, ?);",
      [Number(userId), body.toString().slice(0, 255), link ? link.toString().slice(0, 255) : null]
    );
  } catch (error) {
    // Notifications are nice-to-have, never block the parent flow.
    console.error("addNotification failed:", error.message);
  }
}

async function listForUser(userId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT notification_id, body, link, is_read, created_at
     FROM notifications WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ?;`,
    [Number(userId), Number(limit)]
  );
  return rows;
}

async function markAllRead(userId) {
  await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0;",
    [Number(userId)]
  );
}

module.exports = { addNotification, listForUser, markAllRead };
