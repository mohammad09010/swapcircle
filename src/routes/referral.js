const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Deterministically generate a referral code from the user ID.
// In a real product this would be persisted, but for the MVP a hash
// keeps it stable across restarts and unique per user.
function codeForUser(userId) {
  return crypto
    .createHash("sha1")
    .update(`swapcircle:${userId}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
}

router.get("/", requireAuth, (req, res) => {
  const userId = req.currentUser.user_id;
  const code = codeForUser(userId);
  // Build the absolute link from the host header so it works whether
  // the user opens the app on localhost or behind a domain.
  const protocol = req.protocol;
  const host = req.get("host");
  const link = `${protocol}://${host}/auth/register?ref=${code}`;
  res.render("referral", {
    pageTitle: "Invite friends",
    code,
    link,
    invitesAccepted: 0  // placeholder: feature wired but counter starts at 0 per user
  });
});

module.exports = router;
