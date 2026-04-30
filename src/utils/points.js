const { pool } = require("../db");

// Centralised reward table so the values are documented in one place.
// These are deliberately small numbers so progress feels meaningful.
const POINTS = Object.freeze({
  SWAP_COMPLETED: 10,
  ITEM_LISTED: 5,
  RATING_GIVEN: 2
});

async function awardPoints(userId, amount) {
  if (!userId || !amount) return;
  await pool.query(
    "UPDATE users SET points = points + ? WHERE user_id = ?;",
    [Number(amount), Number(userId)]
  );
}

// Map a points total to a human label that shows in the navbar.
function levelFromPoints(points) {
  if (points >= 200) return "Top Swapper";
  if (points >= 100) return "Trusted Member";
  if (points >= 50)  return "Active Swapper";
  if (points >= 20)  return "Rising Member";
  return "New Member";
}

module.exports = { POINTS, awardPoints, levelFromPoints };
