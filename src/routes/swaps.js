const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { formatRelativeDate } = require("../utils/view-helpers");
const { awardPoints, POINTS } = require("../utils/points");
const { addNotification } = require("../utils/notifications");

const router = express.Router();

// All swap routes require authentication.
router.use(requireAuth);

// --- Inbox: list all swap requests for the current user --------------
router.get("/", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;

    const [incoming] = await pool.query(
      `SELECT sr.request_id, sr.status, sr.message, sr.created_at,
              i.item_id AS target_item_id, i.title AS target_title, i.image_path AS target_image,
              oi.title AS offered_title, oi.image_path AS offered_image,
              u.user_id AS requester_id, u.display_name AS requester_name, u.avatar_path AS requester_avatar
       FROM swap_requests sr
       JOIN items i ON i.item_id = sr.target_item_id
       LEFT JOIN items oi ON oi.item_id = sr.offered_item_id
       JOIN users u ON u.user_id = sr.requester_id
       WHERE sr.owner_id = ?
       ORDER BY FIELD(sr.status,'pending','accepted','completed','rejected','cancelled'), sr.created_at DESC;`,
      [userId]
    );

    const [outgoing] = await pool.query(
      `SELECT sr.request_id, sr.status, sr.message, sr.created_at,
              i.item_id AS target_item_id, i.title AS target_title, i.image_path AS target_image,
              oi.title AS offered_title, oi.image_path AS offered_image,
              u.user_id AS owner_id, u.display_name AS owner_name, u.avatar_path AS owner_avatar
       FROM swap_requests sr
       JOIN items i ON i.item_id = sr.target_item_id
       LEFT JOIN items oi ON oi.item_id = sr.offered_item_id
       JOIN users u ON u.user_id = sr.owner_id
       WHERE sr.requester_id = ?
       ORDER BY FIELD(sr.status,'pending','accepted','completed','rejected','cancelled'), sr.created_at DESC;`,
      [userId]
    );

    const decorate = (rows) => rows.map((r) => ({ ...r, relativeDate: formatRelativeDate(r.created_at) }));

    res.render("my_swaps", {
      pageTitle: "My Swaps",
      incoming: decorate(incoming),
      outgoing: decorate(outgoing)
    });
  } catch (error) {
    next(error);
  }
});

// --- Conversation page for a single swap request ---------------------
router.get("/:id", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const requestId = Number(req.params.id);

    const [[swap]] = await pool.query(
      `SELECT sr.*,
              i.title AS target_title, i.image_path AS target_image, i.item_id AS target_item_id,
              oi.title AS offered_title, oi.image_path AS offered_image,
              ru.display_name AS requester_name, ru.avatar_path AS requester_avatar,
              ou.display_name AS owner_name, ou.avatar_path AS owner_avatar
       FROM swap_requests sr
       JOIN items i ON i.item_id = sr.target_item_id
       LEFT JOIN items oi ON oi.item_id = sr.offered_item_id
       JOIN users ru ON ru.user_id = sr.requester_id
       JOIN users ou ON ou.user_id = sr.owner_id
       WHERE sr.request_id = ? LIMIT 1;`,
      [requestId]
    );

    if (!swap || (swap.requester_id !== userId && swap.owner_id !== userId)) {
      return res.status(404).render("not_found", {
        pageTitle: "Swap not found",
        pageClass: "page-not-found"
      });
    }

    const [messages] = await pool.query(
      `SELECT m.message_id, m.body, m.created_at, m.sender_id,
              u.display_name AS sender_name, u.avatar_path AS sender_avatar
       FROM messages m JOIN users u ON u.user_id = m.sender_id
       WHERE m.swap_request_id = ?
       ORDER BY m.created_at ASC;`,
      [requestId]
    );

    // Mark counterpart messages as read for the current user.
    await pool.query(
      "UPDATE messages SET is_read = 1 WHERE swap_request_id = ? AND sender_id <> ?;",
      [requestId, userId]
    );

    const [existingRating] = await pool.query(
      "SELECT rating_id FROM ratings WHERE swap_request_id = ? AND rater_id = ? LIMIT 1;",
      [requestId, userId]
    );

    res.render("swap_thread", {
      pageTitle: `Swap: ${swap.target_title}`,
      swap: { ...swap, relativeDate: formatRelativeDate(swap.created_at) },
      messages: messages.map((m) => ({ ...m, relativeDate: formatRelativeDate(m.created_at) })),
      isOwner: swap.owner_id === userId,
      isRequester: swap.requester_id === userId,
      hasRated: existingRating.length > 0
    });
  } catch (error) {
    next(error);
  }
});

// --- Create a new swap request from the item detail page -------------
router.post("/new", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const targetItemId = Number(req.body.target_item_id);
    const offeredItemId = req.body.offered_item_id ? Number(req.body.offered_item_id) : null;
    const message = (req.body.message || "").toString().trim().slice(0, 1000);

    if (!Number.isInteger(targetItemId) || targetItemId <= 0) {
      return res.status(400).redirect("/items");
    }

    const [[target]] = await pool.query(
      "SELECT item_id, owner_user_id, title, is_available FROM items WHERE item_id = ? LIMIT 1;",
      [targetItemId]
    );

    if (!target) return res.status(404).redirect("/items");
    if (target.owner_user_id === userId) {
      return res.status(400).render("server_error", {
        pageTitle: "Invalid request",
        pageClass: "page-error",
        message: "You cannot send a swap request for your own item."
      });
    }
    if (!target.is_available) {
      return res.status(400).render("server_error", {
        pageTitle: "Unavailable",
        pageClass: "page-error",
        message: "This item is no longer available for swap."
      });
    }

    // Enforce one open request per user/item to avoid spam.
    const [dup] = await pool.query(
      `SELECT request_id FROM swap_requests
       WHERE requester_id = ? AND target_item_id = ?
         AND status IN ('pending','accepted') LIMIT 1;`,
      [userId, targetItemId]
    );
    if (dup.length) return res.redirect(`/my-swaps/${dup[0].request_id}`);

    if (offeredItemId) {
      const [[offered]] = await pool.query(
        "SELECT owner_user_id FROM items WHERE item_id = ? LIMIT 1;",
        [offeredItemId]
      );
      if (!offered || offered.owner_user_id !== userId) {
        return res.status(400).render("server_error", {
          pageTitle: "Invalid offer",
          pageClass: "page-error",
          message: "You can only offer items that you own."
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO swap_requests (requester_id, owner_id, target_item_id, offered_item_id, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending');`,
      [userId, target.owner_user_id, targetItemId, offeredItemId, message || null]
    );

    await addNotification(
      target.owner_user_id,
      `New swap request for ${target.title}`,
      `/my-swaps/${result.insertId}`
    );

    res.redirect(`/my-swaps/${result.insertId}`);
  } catch (error) {
    next(error);
  }
});

// --- Accept / reject / complete / cancel actions ---------------------
async function transitionStatus(req, res, next, newStatus) {
  try {
    const userId = req.currentUser.user_id;
    const requestId = Number(req.params.id);

    const [[swap]] = await pool.query(
      "SELECT * FROM swap_requests WHERE request_id = ? LIMIT 1;",
      [requestId]
    );
    if (!swap) return res.status(404).redirect("/my-swaps");

    const allowed = {
      accepted: swap.owner_id === userId && swap.status === "pending",
      rejected: swap.owner_id === userId && swap.status === "pending",
      cancelled: swap.requester_id === userId && swap.status === "pending",
      completed:
        (swap.owner_id === userId || swap.requester_id === userId) &&
        swap.status === "accepted"
    }[newStatus];

    if (!allowed) {
      return res.status(403).render("server_error", {
        pageTitle: "Not allowed",
        pageClass: "page-error",
        message: "You are not allowed to perform that action on this swap."
      });
    }

    await pool.query(
      "UPDATE swap_requests SET status = ? WHERE request_id = ?;",
      [newStatus, requestId]
    );

    if (newStatus === "completed") {
      await pool.query(
        `UPDATE users SET swaps_completed = swaps_completed + 1
         WHERE user_id IN (?, ?);`,
        [swap.owner_id, swap.requester_id]
      );
      await pool.query(
        "UPDATE items SET is_available = 0 WHERE item_id IN (?, ?);",
        [swap.target_item_id, swap.offered_item_id || swap.target_item_id]
      );
      await awardPoints(swap.owner_id, POINTS.SWAP_COMPLETED);
      await awardPoints(swap.requester_id, POINTS.SWAP_COMPLETED);
      await addNotification(swap.requester_id, "Swap marked as completed. Leave a rating!", `/my-swaps/${requestId}`);
      await addNotification(swap.owner_id, "Swap marked as completed. Leave a rating!", `/my-swaps/${requestId}`);
    } else if (newStatus === "accepted") {
      await addNotification(swap.requester_id, "Your swap request was accepted", `/my-swaps/${requestId}`);
    } else if (newStatus === "rejected") {
      await addNotification(swap.requester_id, "Your swap request was declined", `/my-swaps/${requestId}`);
    }

    res.redirect(`/my-swaps/${requestId}`);
  } catch (error) {
    next(error);
  }
}

router.post("/:id/accept", (req, res, next) => transitionStatus(req, res, next, "accepted"));
router.post("/:id/reject", (req, res, next) => transitionStatus(req, res, next, "rejected"));
router.post("/:id/cancel", (req, res, next) => transitionStatus(req, res, next, "cancelled"));
router.post("/:id/complete", (req, res, next) => transitionStatus(req, res, next, "completed"));

// --- Send a message inside a swap thread -----------------------------
router.post("/:id/messages", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const requestId = Number(req.params.id);
    const body = (req.body.body || "").toString().trim().slice(0, 2000);
    if (!body) return res.redirect(`/my-swaps/${requestId}`);

    const [[swap]] = await pool.query(
      "SELECT requester_id, owner_id FROM swap_requests WHERE request_id = ? LIMIT 1;",
      [requestId]
    );
    if (!swap || (swap.requester_id !== userId && swap.owner_id !== userId)) {
      return res.status(404).redirect("/my-swaps");
    }

    await pool.query(
      "INSERT INTO messages (swap_request_id, sender_id, body) VALUES (?, ?, ?);",
      [requestId, userId, body]
    );

    const recipientId = swap.requester_id === userId ? swap.owner_id : swap.requester_id;
    await addNotification(recipientId, `${req.currentUser.display_name} sent you a message`, `/my-swaps/${requestId}`);

    res.redirect(`/my-swaps/${requestId}`);
  } catch (error) {
    next(error);
  }
});

// --- Submit a star rating after the swap is complete -----------------
router.post("/:id/rate", async (req, res, next) => {
  try {
    const userId = req.currentUser.user_id;
    const requestId = Number(req.params.id);
    const stars = Math.max(1, Math.min(5, Number(req.body.stars) || 0));
    const comment = (req.body.comment || "").toString().trim().slice(0, 500) || null;

    const [[swap]] = await pool.query(
      "SELECT requester_id, owner_id, status FROM swap_requests WHERE request_id = ? LIMIT 1;",
      [requestId]
    );
    if (!swap) return res.redirect("/my-swaps");
    if (swap.status !== "completed") {
      return res.status(400).render("server_error", {
        pageTitle: "Cannot rate yet",
        pageClass: "page-error",
        message: "Ratings can only be left once a swap is completed."
      });
    }
    if (swap.requester_id !== userId && swap.owner_id !== userId) {
      return res.status(403).redirect("/my-swaps");
    }

    const rateeId = swap.requester_id === userId ? swap.owner_id : swap.requester_id;

    try {
      await pool.query(
        `INSERT INTO ratings (swap_request_id, rater_id, ratee_id, stars, comment)
         VALUES (?, ?, ?, ?, ?);`,
        [requestId, userId, rateeId, stars, comment]
      );
    } catch (err) {
      // Duplicate rating -> ignore silently
      if (err.code !== "ER_DUP_ENTRY") throw err;
    }

    // Recalculate aggregate rating for the ratee
    await pool.query(
      `UPDATE users u
       SET rating_count = (SELECT COUNT(*) FROM ratings WHERE ratee_id = u.user_id),
           rating_sum   = (SELECT COALESCE(SUM(stars),0) FROM ratings WHERE ratee_id = u.user_id),
           rating       = COALESCE((SELECT ROUND(AVG(stars),1) FROM ratings WHERE ratee_id = u.user_id), 5.0)
       WHERE u.user_id = ?;`,
      [rateeId]
    );

    await awardPoints(userId, POINTS.RATING_GIVEN);
    res.redirect(`/my-swaps/${requestId}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
