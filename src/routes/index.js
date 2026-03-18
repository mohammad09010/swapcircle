const express = require("express");
const { pool } = require("../db");
const { formatRelativeDate } = require("../utils/view-helpers");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [featuredItems] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist, i.location_text,
              i.image_path, i.condition_note, i.created_at,
              u.display_name AS owner_name
       FROM items i
       LEFT JOIN users u ON u.user_id = i.owner_user_id
       WHERE i.is_featured = 1 AND i.is_available = 1
       ORDER BY i.created_at DESC
       LIMIT 4;`
    );

    const [latestItems] = await pool.query(
      `SELECT item_id, title, item_type, author_artist, location_text,
              image_path, created_at
       FROM items
       WHERE is_available = 1 AND is_featured = 0
       ORDER BY created_at DESC
       LIMIT 4;`
    );

    res.render("index", {
      pageTitle: "Home",
      featuredItems: featuredItems.map((item) => ({
        ...item,
        relativeDate: formatRelativeDate(item.created_at)
      })),
      latestItems: latestItems.map((item) => ({
        ...item,
        relativeDate: formatRelativeDate(item.created_at)
      })),
      heroImage: "/public/images/hero/record-shelf.jpg"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
