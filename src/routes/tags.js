const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [tags] = await pool.query(
      `SELECT t.tag_id, t.name, COUNT(it.item_id) AS item_count
       FROM tags t
       LEFT JOIN item_tags it ON it.tag_id = t.tag_id
       GROUP BY t.tag_id, t.name
       ORDER BY t.name;`
    );
    res.render("tags", { projectName: "SwapCircle", tags });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/items", async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    if (!Number.isInteger(tagId) || tagId <= 0) {
      return res.status(400).render("status_message", {
        projectName: "SwapCircle",
        title: "Invalid tag",
        message: "The tag ID is not valid. Please choose a tag from the tags page.",
        primaryLink: "/tags",
        primaryText: "Browse tags",
        secondaryLink: "/",
        secondaryText: "Go home"
      });
    }

    const [[tag]] = await pool.query(
      "SELECT tag_id, name FROM tags WHERE tag_id = ?;",
      [tagId]
    );

    if (!tag) {
      return res.status(404).render("status_message", {
        projectName: "SwapCircle",
        title: "Tag not found",
        message: "That category does not exist in the current database.",
        primaryLink: "/tags",
        primaryText: "Back to tags",
        secondaryLink: "/items",
        secondaryText: "Browse items"
      });
    }

    const [items] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist, i.condition_note,
              u.display_name AS owner_name
       FROM item_tags it
       JOIN items i ON i.item_id = it.item_id
       LEFT JOIN users u ON u.user_id = i.owner_user_id
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
