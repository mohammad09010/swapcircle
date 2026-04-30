const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { listForUser, markAllRead } = require("../utils/notifications");
const { recommendForUser } = require("../utils/recommendations");
const { levelFromPoints } = require("../utils/points");

const router = express.Router();

// --- Public leaderboard --------------------------------------------------
router.get("/leaderboard", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, display_name, avatar_path, badge_label,
              points, rating, swaps_completed
       FROM users
       ORDER BY points DESC, swaps_completed DESC
       LIMIT 20;`
    );
    const board = rows.map((u, idx) => ({
      ...u,
      rank: idx + 1,
      level: levelFromPoints(u.points)
    }));
    res.render("leaderboard", { pageTitle: "Leaderboard", board });
  } catch (error) {
    next(error);
  }
});

// --- Personal dashboard --------------------------------------------------
router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;

    const [[stats]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM swap_requests WHERE owner_id = ? AND status='pending') AS pending_inbox,
         (SELECT COUNT(*) FROM swap_requests WHERE requester_id = ? AND status='pending') AS pending_outbox,
         (SELECT COUNT(*) FROM swap_requests WHERE (owner_id=? OR requester_id=?) AND status='accepted') AS active,
         (SELECT COUNT(*) FROM favorites WHERE user_id=?) AS favorites,
         (SELECT COUNT(*) FROM items WHERE owner_user_id=?) AS my_items
       FROM dual;`,
      [userId, userId, userId, userId, userId, userId]
    );

    const recommendations = await recommendForUser(userId, 4);
    const notifications = await listForUser(userId, 6);

    res.render("dashboard", {
      pageTitle: "My Dashboard",
      stats,
      recommendations,
      notifications,
      level: levelFromPoints(req.currentUser.points)
    });
  } catch (error) {
    next(error);
  }
});

// --- Notifications: mark all read --------------------------------------
router.post("/notifications/read", requireAuth, async (req, res, next) => {
  try {
    await markAllRead(req.currentUser.user_id);
    res.redirect(req.get("Referer") || "/dashboard");
  } catch (error) {
    next(error);
  }
});

// --- Favourites toggle (used by item cards) ----------------------------
router.post("/favorites/:itemId/toggle", requireAuth, async (req, res, next) => {
  try {
    const itemId = Number(req.params.itemId);
    const userId = req.currentUser.user_id;
    if (!Number.isInteger(itemId) || itemId <= 0) return res.redirect("/items");

    const [existing] = await pool.query(
      "SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ? LIMIT 1;",
      [userId, itemId]
    );

    if (existing.length) {
      await pool.query(
        "DELETE FROM favorites WHERE user_id = ? AND item_id = ?;",
        [userId, itemId]
      );
    } else {
      await pool.query(
        "INSERT IGNORE INTO favorites (user_id, item_id) VALUES (?, ?);",
        [userId, itemId]
      );
    }

    res.redirect(req.get("Referer") || `/items/${itemId}`);
  } catch (error) {
    next(error);
  }
});

// --- My favourites listing ---------------------------------------------
router.get("/favorites", requireAuth, async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const [items] = await pool.query(
      `SELECT i.item_id, i.title, i.author_artist, i.item_type, i.image_path,
              i.location_text, i.condition_note,
              u.display_name AS owner_name
       FROM favorites f
       JOIN items i ON i.item_id = f.item_id
       JOIN users u ON u.user_id = i.owner_user_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC;`,
      [userId]
    );

    res.render("favorites", { pageTitle: "Saved Items", items });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
