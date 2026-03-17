const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let dbStatus = "OK";
  let serverTime = null;
  let sampleItems = [];
  let stats = { items: 0, users: 0, tags: 0 };

  try {
    const [rows] = await pool.query("SELECT NOW() AS nowTime;");
    serverTime = rows?.[0]?.nowTime ?? null;

    const [items] = await pool.query(
      `SELECT i.item_id, i.title, i.item_type, i.author_artist,
              u.display_name AS owner_name
       FROM items i
       LEFT JOIN users u ON u.user_id = i.owner_user_id
       ORDER BY i.created_at DESC
       LIMIT 6;`
    );
    sampleItems = items;

    const [[itemCount]] = await pool.query("SELECT COUNT(*) AS total FROM items;");
    const [[userCount]] = await pool.query("SELECT COUNT(*) AS total FROM users;");
    const [[tagCount]] = await pool.query("SELECT COUNT(*) AS total FROM tags;");

    stats = {
      items: itemCount?.total ?? 0,
      users: userCount?.total ?? 0,
      tags: tagCount?.total ?? 0
    };
  } catch (err) {
    dbStatus = "ERROR";
  }

  res.render("index", {
    projectName: "SwapCircle",
    dbStatus,
    serverTime,
    sampleItems,
    stats
  });
});

module.exports = router;
