const express = require("express");
const { pool } = require("../db");
const { formatJoinedDate } = require("../utils/view-helpers");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim().slice(0, 100);
    const params = [];

    let sql = `
      SELECT u.user_id, u.display_name, u.avatar_path, u.joined_at, u.location_text,
             u.badge_label, u.rating, u.swaps_completed,
             COUNT(i.item_id) AS item_count
      FROM users u
      LEFT JOIN items i ON i.owner_user_id = u.user_id
      WHERE 1 = 1
    `;

    if (q) {
      sql += " AND u.display_name LIKE ?";
      params.push(`%${q}%`);
    }

    sql += " GROUP BY u.user_id ORDER BY u.joined_at ASC";

    const [users] = await pool.query(sql, params);

    res.render("users", {
      pageTitle: "Users",
      q,
      users: users.map((user) => ({
        ...user,
        joinedLabel: formatJoinedDate(user.joined_at)
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(404).render("not_found", {
        pageTitle: "User not found",
        pageClass: "page-not-found"
      });
    }

    const [[user]] = await pool.query(
      `SELECT user_id, display_name, avatar_path, bio, location_text,
              badge_label, joined_at, rating, swaps_completed, is_verified
       FROM users
       WHERE user_id = ?;`,
      [userId]
    );

    if (!user) {
      return res.status(404).render("not_found", {
        pageTitle: "User not found",
        pageClass: "page-not-found"
      });
    }

    const [items] = await pool.query(
      `SELECT item_id, title, author_artist, item_type, condition_note, image_path
       FROM items
       WHERE owner_user_id = ?
       ORDER BY created_at DESC;`,
      [userId]
    );

    res.render("user_profile", {
      pageTitle: user.display_name,
      user: {
        ...user,
        joinedLabel: formatJoinedDate(user.joined_at),
        item_count: items.length
      },
      items
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
