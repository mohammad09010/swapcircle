const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const express = require("express");
const multer = require("multer");

const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { awardPoints, POINTS } = require("../utils/points");

const router = express.Router();

const PLACEHOLDER_IMAGE = "/public/images/placeholders/category-placeholder.svg";
const MAX_ITEM_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads", "items");
const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = allowedImageTypes.get(file.mimetype) || path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    files: MAX_ITEM_IMAGES,
    fileSize: MAX_IMAGE_SIZE_BYTES
  },
  fileFilter: (_req, file, cb) => {
    if (allowedImageTypes.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Only JPG, PNG and WebP images are allowed."));
  }
});

function toPublicImagePath(file) {
  return `/public/uploads/items/${file.filename}`;
}

function cleanupUploadedFiles(files = []) {
  for (const file of files) {
    if (!file || !file.path) continue;
    fs.unlink(file.path, () => {});
  }
}

function uploadItemImages(req, res, next) {
  upload.array("item_images", MAX_ITEM_IMAGES)(req, res, async (error) => {
    if (!error) return next();

    cleanupUploadedFiles(req.files);

    try {
      const [tags] = await pool.query("SELECT tag_id, name FROM tags ORDER BY name ASC;");
      const rawTagIds = req.body ? req.body.tag_ids : [];
      const tagIds = Array.isArray(rawTagIds) ? rawTagIds : (rawTagIds ? [rawTagIds] : []);

      let message = error.message || "The selected images could not be uploaded.";
      if (error.code === "LIMIT_FILE_SIZE") message = "Each image must be 2MB or smaller.";
      if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
        message = "Please upload a maximum of 5 item images.";
      }

      return res.status(400).render("item_new", {
        pageTitle: "List a new item",
        tags,
        formValues: {
          title: (req.body?.title || "").toString(),
          author_artist: (req.body?.author_artist || "").toString(),
          item_type: (req.body?.item_type || "book").toString(),
          condition_note: (req.body?.condition_note || "").toString(),
          description: (req.body?.description || "").toString(),
          location_text: (req.body?.location_text || "").toString(),
          tagIds: tagIds.map(Number)
        },
        flashError: message
      });
    } catch (renderError) {
      return next(renderError);
    }
  });
}

// New listing form (HTML page)
router.get("/items/new", requireAuth, async (req, res, next) => {
  try {
    const [tags] = await pool.query("SELECT tag_id, name FROM tags ORDER BY name ASC;");
    res.render("item_new", {
      pageTitle: "List a new item",
      tags,
      formValues: { title: "", author_artist: "", item_type: "book", condition_note: "", description: "", location_text: "", tagIds: [] },
      flashError: null
    });
  } catch (error) {
    next(error);
  }
});

// Handle form submit
router.post("/items/new", requireAuth, uploadItemImages, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.currentUser.user_id;
    const title = (req.body.title || "").toString().trim().slice(0, 200);
    const author_artist = (req.body.author_artist || "").toString().trim().slice(0, 200);
    const item_type = ["book", "record"].includes(req.body.item_type) ? req.body.item_type : "book";
    const condition_note = (req.body.condition_note || "").toString().trim().slice(0, 100);
    const description = (req.body.description || "").toString().trim().slice(0, 2000);
    const location_text = (req.body.location_text || "").toString().trim().slice(0, 120);
    const uploadedImages = (req.files || []).map(toPublicImagePath);
    const image_path = uploadedImages[0] || PLACEHOLDER_IMAGE;
    const gallery_image_2 = uploadedImages[1] || null;
    const gallery_image_3 = uploadedImages[2] || null;
    const gallery_image_4 = uploadedImages[3] || null;
    const gallery_image_5 = uploadedImages[4] || null;
    const rawTagIds = req.body.tag_ids;
    const tagIds = Array.isArray(rawTagIds) ? rawTagIds : (rawTagIds ? [rawTagIds] : []);

    if (!title || !author_artist || !condition_note) {
      cleanupUploadedFiles(req.files);
      const [tags] = await pool.query("SELECT tag_id, name FROM tags ORDER BY name ASC;");
      return res.status(400).render("item_new", {
        pageTitle: "List a new item",
        tags,
        formValues: { title, author_artist, item_type, condition_note, description, location_text, tagIds: tagIds.map(Number) },
        flashError: "Please fill in title, author/artist and condition."
      });
    }

    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO items (title, author_artist, item_type, condition_note, description,
                          image_path, gallery_image_2, gallery_image_3, gallery_image_4, gallery_image_5,
                          location_text, owner_user_id, is_featured, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1);`,
      [
        title,
        author_artist,
        item_type,
        condition_note,
        description,
        image_path,
        gallery_image_2,
        gallery_image_3,
        gallery_image_4,
        gallery_image_5,
        location_text,
        userId
      ]
    );
    const itemId = result.insertId;

    for (const id of tagIds.map(Number).filter(Number.isInteger)) {
      await conn.query(
        "INSERT IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?);",
        [itemId, id]
      );
    }
    await conn.commit();

    await awardPoints(userId, POINTS.ITEM_LISTED);
    res.redirect(`/items/${itemId}`);
  } catch (error) {
    cleanupUploadedFiles(req.files);
    try { await conn.rollback(); } catch (_) { /* noop */ }
    next(error);
  } finally {
    conn.release();
  }
});

module.exports = router;
