const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim().slice(0, 100);
    const params = [];

    let sql = `
      SELECT t.tag_id, t.name, t.description, t.cover_image_path,
             COUNT(it.item_id) AS item_count
      FROM tags t
      LEFT JOIN item_tags it ON it.tag_id = t.tag_id
      WHERE 1 = 1
    `;

    if (q) {
      sql += " AND t.name LIKE ?";
      params.push(`%${q}%`);
    }

    sql += " GROUP BY t.tag_id ORDER BY t.name ASC";

    const [tags] = await pool.query(sql, params);

    res.render("tags", {
      pageTitle: "Tags",
      tags,
      q
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/items", async (req, res, next) => {
  try {
    const tagId = Number(req.params.id);
    if (!Number.isInteger(tagId) || tagId <= 0) {
      return res.status(404).render("not_found", {
        pageTitle: "Category not found",
        pageClass: "page-not-found"
      });
    }

    const [[tag]] = await pool.query(
      `SELECT tag_id, name, description, cover_image_path
       FROM tags
       WHERE tag_id = ?;`,
      [tagId]
    );

    if (!tag) {
      return res.status(404).render("not_found", {
        pageTitle: "Category not found",
        pageClass: "page-not-found"
      });
    }

    const [sidebarTags] = await pool.query(
      `SELECT t.tag_id, t.name, COUNT(it.item_id) AS item_count
       FROM tags t
       LEFT JOIN item_tags it ON it.tag_id = t.tag_id
       GROUP BY t.tag_id
       ORDER BY t.name ASC;`
    );

    const [items] = await pool.query(
      `SELECT i.item_id, i.title, i.author_artist, i.item_type, i.image_path,
              i.condition_note, i.location_text
       FROM item_tags it
       JOIN items i ON i.item_id = it.item_id
       WHERE it.tag_id = ?
       ORDER BY i.created_at DESC;`,
      [tagId]
    );

    res.render("tag_items", {
      pageTitle: `Items tagged ${tag.name}`,
      tag,
      items,
      sidebarTags,
      itemCount: items.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
