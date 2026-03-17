const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// Listings page (DB-driven)
router.get("/", async (req, res, next) => {
  try {
    const type = req.query.type;
    const qRaw = (req.query.q || "").toString().trim();
    const q = qRaw.length > 80 ? qRaw.slice(0, 80) : qRaw;

    const params = [];
    let sql = `
      SELECT i.item_id, i.title, i.item_type, i.author_artist, i.condition_note,
             u.display_name AS owner_name
      FROM items i
      LEFT JOIN users u ON u.user_id = i.owner_user_id
      WHERE 1=1
    `;

    if (type === "book" || type === "record") {
      sql += " AND i.item_type = ? ";
      params.push(type);
    }

    if (q.length > 0) {
      sql += " AND (i.title LIKE ? OR i.author_artist LIKE ?) ";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY i.created_at DESC;";

    const [items] = await pool.query(sql, params);

    res.render("items", {
      projectName: "SwapCircle",
      items,
      selectedType: type === "book" || type === "record" ? type : "",
      q
    });
  } catch (err) {
    next(err);
  }
});

// Detail page (DB-driven)
router.get("/:id", async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).render("status_message", {
        projectName: "SwapCircle",
        title: "Invalid item",
        message: "The item ID is not valid. Please choose an item from the listings page.",
        primaryLink: "/items",
        primaryText: "Browse items",
        secondaryLink: "/",
        secondaryText: "Go home"
      });
    }

    const [[item]] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist, i.condition_note,
              i.created_at,
              u.user_id AS owner_id, u.display_name AS owner_name
       FROM items i
       LEFT JOIN users u ON u.user_id = i.owner_user_id
       WHERE i.item_id = ?;`,
      [itemId]
    );

    if (!item) {
      return res.status(404).render("status_message", {
        projectName: "SwapCircle",
        title: "Item not found",
        message: "That listing does not exist or may have been removed.",
        primaryLink: "/items",
        primaryText: "Back to items",
        secondaryLink: "/tags",
        secondaryText: "Explore tags"
      });
    }

    const [tags] = await pool.query(
      `SELECT t.tag_id, t.name
       FROM item_tags it
       JOIN tags t ON t.tag_id = it.tag_id
       WHERE it.item_id = ?
       ORDER BY t.name;`,
      [itemId]
    );

    res.render("item_detail", { projectName: "SwapCircle", item, tags });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
