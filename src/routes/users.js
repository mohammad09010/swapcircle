const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.display_name, u.created_at,
              COUNT(i.item_id) AS item_count
       FROM users u
       LEFT JOIN items i ON i.owner_user_id = u.user_id
       GROUP BY u.user_id, u.display_name, u.created_at
       ORDER BY u.created_at DESC;`
    );

    res.render("users", { projectName: "SwapCircle", users });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).render("status_message", {
        projectName: "SwapCircle",
        title: "Invalid member",
        message: "The member ID is not valid. Please choose a member from the users page.",
        primaryLink: "/users",
        primaryText: "Browse users",
        secondaryLink: "/",
        secondaryText: "Go home"
      });
    }

    const [[user]] = await pool.query(
      "SELECT user_id, display_name, created_at FROM users WHERE user_id = ?;",
      [userId]
    );

    if (!user) {
      return res.status(404).render("status_message", {
        projectName: "SwapCircle",
        title: "User not found",
        message: "That member profile does not exist in the current database.",
        primaryLink: "/users",
        primaryText: "Back to users",
        secondaryLink: "/items",
        secondaryText: "Browse items"
      });
    }

    const [items] = await pool.query(
      `SELECT item_id, title, item_type, author_artist, condition_note
       FROM items
       WHERE owner_user_id = ?
       ORDER BY created_at DESC;`,
      [userId]
    );

    res.render("user_profile", { projectName: "SwapCircle", user, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
