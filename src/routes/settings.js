const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function clean(value, max) {
  return (value || "").toString().trim().slice(0, max);
}

// --- View settings -----------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const [[user]] = await pool.query(
      "SELECT user_id, display_name, email, location_text, bio, avatar_path FROM users WHERE user_id = ? LIMIT 1;",
      [userId]
    );
    res.render("settings", {
      pageTitle: "Settings",
      user,
      flashSuccess: req.session.flashSuccess || null,
      flashError: req.session.flashError || null
    });
    req.session.flashSuccess = null;
    req.session.flashError = null;
  } catch (error) {
    next(error);
  }
});

// --- Update profile ----------------------------------------------------
router.post("/profile", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const display_name = clean(req.body.display_name, 80);
    const location_text = clean(req.body.location_text, 120) || null;
    const bio = clean(req.body.bio, 1000) || null;
    const avatar_path = clean(req.body.avatar_path, 255) || null;

    if (display_name.length < 2) {
      req.session.flashError = "Display name must be at least 2 characters.";
      return res.redirect("/settings");
    }

    await pool.query(
      `UPDATE users SET display_name = ?, location_text = ?, bio = ?, avatar_path = ?
       WHERE user_id = ?;`,
      [display_name, location_text, bio, avatar_path, userId]
    );
    req.session.flashSuccess = "Profile updated.";
    res.redirect("/settings");
  } catch (error) {
    next(error);
  }
});

// --- Change password ---------------------------------------------------
router.post("/password", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const current_password = (req.body.current_password || "").toString();
    const new_password = (req.body.new_password || "").toString();

    if (new_password.length < 8) {
      req.session.flashError = "New password must be at least 8 characters.";
      return res.redirect("/settings");
    }

    const [[user]] = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = ? LIMIT 1;",
      [userId]
    );
    if (!user || !user.password_hash) {
      req.session.flashError = "Could not verify your current password.";
      return res.redirect("/settings");
    }

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) {
      req.session.flashError = "Current password is incorrect.";
      return res.redirect("/settings");
    }

    const hash = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE user_id = ?;", [hash, userId]);
    req.session.flashSuccess = "Password changed successfully.";
    res.redirect("/settings");
  } catch (error) {
    next(error);
  }
});

// --- Update tag preferences (used by recommender) ----------------------
router.post("/preferences", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.currentUser.user_id;
    const raw = req.body.tag_ids;
    const tagIds = (Array.isArray(raw) ? raw : (raw ? [raw] : []))
      .map(Number).filter(Number.isInteger);

    await conn.beginTransaction();
    await conn.query("DELETE FROM user_tag_preferences WHERE user_id = ?;", [userId]);
    for (const tagId of tagIds) {
      await conn.query(
        "INSERT INTO user_tag_preferences (user_id, tag_id, weight) VALUES (?, ?, 3);",
        [userId, tagId]
      );
    }
    await conn.commit();
    req.session.flashSuccess = "Recommendation preferences updated.";
    res.redirect("/settings");
  } catch (error) {
    try { await conn.rollback(); } catch (_) { /* noop */ }
    next(error);
  } finally {
    conn.release();
  }
});

module.exports = router;
