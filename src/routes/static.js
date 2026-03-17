const express = require("express");

const router = express.Router();

router.get("/support", (req, res) => {
  res.render("support", {
    pageTitle: "Support"
  });
});

router.get("/my-swaps", (req, res) => {
  res.render("my_swaps", {
    pageTitle: "My Swaps"
  });
});

module.exports = router;
