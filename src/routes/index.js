const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  let dbStatus = "OK";
  let serverTime = null;
  let sampleItems = [];

  try {
    const [rows] = await pool.query("SELECT NOW() AS nowTime;");
    serverTime = rows?.[0]?.nowTime ?? null;

    const [items] = await pool.query(
      "SELECT item_id, title, item_type, author_artist FROM items ORDER BY created_at DESC LIMIT 5;"
    );
    sampleItems = items;
  } catch (err) {
    dbStatus = "ERROR";
  }

  res.render("index", {
    projectName: "SwapCircle",
    dbStatus,
    serverTime,
    sampleItems
  });
});

module.exports = router;
