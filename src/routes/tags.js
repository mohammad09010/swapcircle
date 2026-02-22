const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// Tags page (DB-driven)
router.get("/", async (req, res, next) => {
  try {
    const [tags] = await pool.query(
      "SELECT tag_id, name FROM tags ORDER BY name;"
    );
    res.render("tags", { projectName: "SwapCircle", tags });
  } catch (err) {
    next(err);
  }
});

// Items by tag (DB-driven)
router.get("/:id/items", async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    if (!Number.isInteger(tagId) || tagId <= 0) {
      return res.status(400).send("Invalid tag id");
    }

    const [[tag]] = await pool.query(
      "SELECT tag_id, name FROM tags WHERE tag_id = ?;",
      [tagId]
    );

    if (!tag) return res.status(404).send("Tag not found");

    const [items] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist, i.condition_note
       FROM item_tags it
       JOIN items i ON i.item_id = it.item_id
       WHERE it.tag_id = ?
       ORDER BY i.created_at DESC;`,
      [tagId]
    );

    res.render("tag_items", { projectName: "SwapCircle", tag, items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
