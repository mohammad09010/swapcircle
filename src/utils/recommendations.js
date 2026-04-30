const { pool } = require("../db");

// Lightweight in-process cache. Recommendations are not security-critical
// so a 60-second cache per user keeps the home page snappy without
// hammering MySQL on every request.
const cache = new Map();
const TTL_MS = 60_000;

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}
function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value });
}

// Jaccard similarity on tag sets gives a stable score between 0 and 1.
// Adding a small bonus for location match nudges nearby items up the list.
function scoreItem(item, userTagSet, userCity) {
  const itemTags = new Set(item.tag_ids || []);
  const intersection = [...itemTags].filter((t) => userTagSet.has(t)).length;
  const union = new Set([...itemTags, ...userTagSet]).size;
  const jaccard = union ? intersection / union : 0;

  const locationBoost =
    userCity && item.location_text &&
    item.location_text.toLowerCase().includes(userCity.toLowerCase())
      ? 0.2
      : 0;

  // Owner rating contributes a smaller, normalised slice.
  const ratingBoost = item.owner_rating ? (Number(item.owner_rating) / 5) * 0.15 : 0;

  return Number((jaccard + locationBoost + ratingBoost).toFixed(4));
}

// Returns up to `limit` recommended items for the given user. If the
// user has no preferences yet we fall back to the most-tagged items.
async function recommendForUser(userId, limit = 6) {
  if (!userId) return fallbackRecommendations(limit);

  const cacheKey = `user:${userId}:${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  // 1. Build the user's tag profile from explicit prefs + favourite tags.
  const [prefRows] = await pool.query(
    "SELECT tag_id, weight FROM user_tag_preferences WHERE user_id = ?;",
    [userId]
  );
  const [favTagRows] = await pool.query(
    `SELECT it.tag_id FROM favorites f
     JOIN item_tags it ON it.item_id = f.item_id
     WHERE f.user_id = ?;`,
    [userId]
  );
  const tagSet = new Set([
    ...prefRows.map((r) => r.tag_id),
    ...favTagRows.map((r) => r.tag_id)
  ]);

  // 2. Pull the user's city for the location boost.
  const [[user]] = await pool.query(
    "SELECT location_text FROM users WHERE user_id = ? LIMIT 1;",
    [userId]
  );
  const userCity = user && user.location_text
    ? user.location_text.split(",")[0].trim()
    : "";

  // 3. Pull every available item alongside its tags and owner rating.
  const [rows] = await pool.query(
    `SELECT i.item_id, i.title, i.author_artist, i.item_type, i.image_path,
            i.location_text, i.condition_note,
            u.user_id AS owner_id, u.display_name AS owner_name,
            u.rating AS owner_rating,
            GROUP_CONCAT(it.tag_id) AS tag_ids
     FROM items i
     JOIN users u ON u.user_id = i.owner_user_id
     LEFT JOIN item_tags it ON it.item_id = i.item_id
     WHERE i.is_available = 1 AND i.owner_user_id <> ?
     GROUP BY i.item_id;`,
    [userId]
  );

  const scored = rows.map((row) => {
    const tagIds = row.tag_ids ? row.tag_ids.split(",").map(Number) : [];
    const enriched = { ...row, tag_ids: tagIds };
    return { ...enriched, score: scoreItem(enriched, tagSet, userCity) };
  });

  // 4. Sort by score desc, then by recency to break ties.
  scored.sort((a, b) => b.score - a.score || b.item_id - a.item_id);

  const top = scored.slice(0, limit);
  cacheSet(cacheKey, top);
  return top;
}

// Used when the visitor is anonymous or has no preference signals.
async function fallbackRecommendations(limit = 6) {
  const [rows] = await pool.query(
    `SELECT i.item_id, i.title, i.author_artist, i.item_type, i.image_path,
            i.location_text, i.condition_note,
            u.display_name AS owner_name
     FROM items i
     JOIN users u ON u.user_id = i.owner_user_id
     WHERE i.is_available = 1
     ORDER BY i.is_featured DESC, i.created_at DESC
     LIMIT ?;`,
    [Number(limit)]
  );
  return rows;
}

// Used by the item-detail page: items most similar to the one being viewed.
async function similarItems(itemId, limit = 4) {
  const [rows] = await pool.query(
    `SELECT i.item_id, i.title, i.author_artist, i.image_path,
            COUNT(it2.tag_id) AS shared_tags
     FROM item_tags it
     JOIN item_tags it2 ON it.tag_id = it2.tag_id
     JOIN items i ON i.item_id = it2.item_id
     WHERE it.item_id = ? AND i.item_id <> ? AND i.is_available = 1
     GROUP BY i.item_id
     ORDER BY shared_tags DESC, i.created_at DESC
     LIMIT ?;`,
    [Number(itemId), Number(itemId), Number(limit)]
  );
  return rows;
}

function clearCache() { cache.clear(); }

module.exports = { recommendForUser, fallbackRecommendations, similarItems, clearCache };
