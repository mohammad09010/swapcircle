const express = require("express");
const { pool } = require("../db");
const { formatRelativeDate, buildGallery } = require("../utils/view-helpers");

const router = express.Router();

function cleanType(type) {
  return ["book", "record"].includes(type) ? type : "";
}

router.get("/", async (req, res, next) => {
  try {
    const type = cleanType((req.query.type || "").toString().trim().toLowerCase());
    const q = (req.query.q || "").toString().trim().slice(0, 100);
    const sort = (req.query.sort || "recent").toString().trim();

    const params = [];
    let sql = `
      SELECT i.item_id, i.title, i.item_type, i.author_artist, i.location_text,
             i.image_path, i.condition_note, i.created_at,
             u.display_name AS owner_name
      FROM items i
      LEFT JOIN users u ON u.user_id = i.owner_user_id
      WHERE i.is_available = 1
    `;

    if (type) {
      sql += " AND i.item_type = ?";
      params.push(type);
    }

    if (q) {
      sql += " AND (i.title LIKE ? OR i.author_artist LIKE ? OR i.location_text LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (sort === "title") {
      sql += " ORDER BY i.title ASC";
    } else {
      sql += " ORDER BY i.created_at DESC";
    }

    const [items] = await pool.query(sql, params);
    const [recentSwaps] = await pool.query(
      `SELECT title, subtitle, image_path, created_at
       FROM recent_swaps
       ORDER BY created_at DESC
       LIMIT 3;`
    );

    const preparedItems = items.map((item) => ({
      ...item,
      relativeDate: formatRelativeDate(item.created_at)
    }));

    res.render("items", {
      pageTitle: "Items",
      items: preparedItems,
      selectedType: type,
      q,
      sort,
      itemCount: preparedItems.length,
      recentSwaps: recentSwaps.map((swap) => ({
        ...swap,
        relativeDate: formatRelativeDate(swap.created_at)
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(404).render("not_found", {
        pageTitle: "Item not found",
        pageClass: "page-not-found"
      });
    }

    const [[item]] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist, i.condition_note,
              i.description, i.image_path, i.gallery_image_2, i.gallery_image_3,
              i.gallery_image_4, i.location_text, i.created_at,
              u.user_id AS owner_id, u.display_name AS owner_name, u.avatar_path,
              u.location_text AS owner_location, u.badge_label, u.rating,
              u.swaps_completed, u.is_verified
       FROM items i
       LEFT JOIN users u ON u.user_id = i.owner_user_id
       WHERE i.item_id = ?;`,
      [itemId]
    );

    if (!item) {
      return res.status(404).render("not_found", {
        pageTitle: "Item not found",
        pageClass: "page-not-found"
      });
    }

    const [tags] = await pool.query(
      `SELECT t.tag_id, t.name
       FROM item_tags it
       JOIN tags t ON t.tag_id = it.tag_id
       WHERE it.item_id = ?
       ORDER BY t.name ASC;`,
      [itemId]
    );

    const [relatedItems] = await pool.query(
      `SELECT i.item_id, i.title, i.image_path
       FROM item_tags it
       JOIN item_tags it2 ON it.tag_id = it2.tag_id
       JOIN items i ON i.item_id = it2.item_id
       WHERE it.item_id = ? AND i.item_id <> ?
       GROUP BY i.item_id
       ORDER BY i.created_at DESC
       LIMIT 4;`,
      [itemId, itemId]
    );

    res.render("item_detail", {
      pageTitle: item.title,
      item: {
        ...item,
        relativeDate: formatRelativeDate(item.created_at),
        gallery: buildGallery(item)
      },
      tags,
      relatedItems
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
