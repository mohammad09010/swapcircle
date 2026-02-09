const express = require("express");
const { getPool } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const pool = getPool();
  try {
    await pool.query("SELECT 1;");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "not connected" });
  }
});

module.exports = router;
