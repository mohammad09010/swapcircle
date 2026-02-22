const express = require("express");
const { pool } = require("../db");

const router = express.Router();

// Listings page (DB-driven)
router.get("/", async (req, res, next) => {
  try {
    const type = req.query.type; // "book" | "record" | undefined
    const qRaw = (req.query.q || "").toString().trim();

    // Simple limits to keep queries sane
    const q = qRaw.length > 80 ? qRaw.slice(0, 80) : qRaw;

    const params = [];
    let sql = `
      SELECT item_id, title, item_type, author_artist, condition_note
      FROM items
      WHERE 1=1
    `;

    if (type === "book" || type === "record") {
      sql += " AND item_type = ? ";
      params.push(type);
    }

    if (q.length > 0) {
      sql += " AND (title LIKE ? OR author_artist LIKE ?) ";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY created_at DESC;";

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
      return res.status(400).send("Invalid item id");
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

    if (!item) return res.status(404).send("Item not found");

    // Tags for this item (requires tags + item_tags tables)
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
