const { pool } = require("../db");

// Attach the currently logged-in user to req and res.locals on every request.
// This is used by templates so the navigation bar can show login/profile links.
async function attachCurrentUser(req, res, next) {
  res.locals.currentUser = null;
  res.locals.unreadNotifications = 0;
  res.locals.unreadMessages = 0;

  if (!req.session || !req.session.userId) return next();

  try {
    const [[user]] = await pool.query(
      `SELECT user_id, display_name, avatar_path, badge_label,
              points, rating, swaps_completed, is_verified
       FROM users WHERE user_id = ? LIMIT 1;`,
      [req.session.userId]
    );

    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;

      const [[notif]] = await pool.query(
        "SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0;",
        [user.user_id]
      );
      res.locals.unreadNotifications = notif ? notif.c : 0;

      const [[msg]] = await pool.query(
        `SELECT COUNT(*) AS c FROM messages m
         JOIN swap_requests sr ON sr.request_id = m.swap_request_id
         WHERE m.is_read = 0 AND m.sender_id <> ?
           AND (sr.requester_id = ? OR sr.owner_id = ?);`,
        [user.user_id, user.user_id, user.user_id]
      );
      res.locals.unreadMessages = msg ? msg.c : 0;
    }
  } catch (error) {
    console.error("attachCurrentUser failed:", error.message);
  }

  next();
}

// Block a route if the user is not signed in. Stores the original
// destination so the user can be redirected back after logging in.
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.method === "GET") req.session.returnTo = req.originalUrl;
  return res.redirect("/auth/login");
}

module.exports = { attachCurrentUser, requireAuth };
