const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");

const router = express.Router();

function cleanString(value, max) {
  return (value || "").toString().trim().slice(0, max);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// --- Login ----------------------------------------------------------
router.get("/login", (req, res) => {
  if (req.session && req.session.userId) return res.redirect("/");
  res.render("auth/login", {
    pageTitle: "Sign in",
    pageClass: "page-auth",
    formValues: { email: "" },
    flashError: req.session.flashError || null
  });
  req.session.flashError = null;
});

router.post("/login", async (req, res, next) => {
  try {
    const email = cleanString(req.body.email, 120).toLowerCase();
    const password = (req.body.password || "").toString();

    if (!isValidEmail(email) || !password) {
      return res.status(400).render("auth/login", {
        pageTitle: "Sign in",
        pageClass: "page-auth",
        formValues: { email },
        flashError: "Please provide a valid email and password."
      });
    }

    const [[user]] = await pool.query(
      "SELECT user_id, password_hash FROM users WHERE email = ? LIMIT 1;",
      [email]
    );

    if (!user || !user.password_hash) {
      return res.status(401).render("auth/login", {
        pageTitle: "Sign in",
        pageClass: "page-auth",
        formValues: { email },
        flashError: "Email or password is incorrect."
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).render("auth/login", {
        pageTitle: "Sign in",
        pageClass: "page-auth",
        formValues: { email },
        flashError: "Email or password is incorrect."
      });
    }

    req.session.userId = user.user_id;
    const target = req.session.returnTo || "/";
    req.session.returnTo = null;
    res.redirect(target);
  } catch (error) {
    next(error);
  }
});

// --- Register -------------------------------------------------------
router.get("/register", (req, res) => {
  if (req.session && req.session.userId) return res.redirect("/");
  res.render("auth/register", {
    pageTitle: "Join SwapCircle",
    pageClass: "page-auth",
    formValues: { display_name: "", email: "", location_text: "" },
    flashError: null
  });
});

router.post("/register", async (req, res, next) => {
  try {
    const display_name = cleanString(req.body.display_name, 80);
    const email = cleanString(req.body.email, 120).toLowerCase();
    const location_text = cleanString(req.body.location_text, 120) || null;
    const password = (req.body.password || "").toString();
    const formValues = { display_name, email, location_text };

    if (display_name.length < 2 || !isValidEmail(email) || password.length < 8) {
      return res.status(400).render("auth/register", {
        pageTitle: "Join SwapCircle",
        pageClass: "page-auth",
        formValues,
        flashError: "Please fill in every field. Passwords must be 8+ characters."
      });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1;",
      [email]
    );
    if (existing.length) {
      return res.status(409).render("auth/register", {
        pageTitle: "Join SwapCircle",
        pageClass: "page-auth",
        formValues,
        flashError: "An account already exists with that email."
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users
         (display_name, email, password_hash, location_text, badge_label, joined_at, rating, swaps_completed, is_verified, points)
       VALUES (?, ?, ?, ?, 'New Member', CURDATE(), 5.0, 0, 0, 0);`,
      [display_name, email, password_hash, location_text]
    );

    req.session.userId = result.insertId;
    res.redirect("/");
  } catch (error) {
    next(error);
  }
});

// --- Logout ---------------------------------------------------------
router.post("/logout", (req, res) => {
  if (req.session) req.session.destroy(() => res.redirect("/"));
  else res.redirect("/");
});

module.exports = router;
