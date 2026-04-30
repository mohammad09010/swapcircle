// Lightweight unit tests for the helpers that don't touch MySQL.
// These run in CI via "npm test" (Node's built-in test runner).
const test = require("node:test");
const assert = require("node:assert");

const { levelFromPoints, POINTS } = require("../src/utils/points");
const { formatRelativeDate, buildGallery } = require("../src/utils/view-helpers");

test("levelFromPoints produces the expected tiers", () => {
  assert.strictEqual(levelFromPoints(0), "New Member");
  assert.strictEqual(levelFromPoints(25), "Rising Member");
  assert.strictEqual(levelFromPoints(50), "Active Swapper");
  assert.strictEqual(levelFromPoints(150), "Trusted Member");
  assert.strictEqual(levelFromPoints(500), "Top Swapper");
});

test("POINTS table is frozen and exposes the documented values", () => {
  assert.strictEqual(POINTS.SWAP_COMPLETED, 10);
  assert.strictEqual(POINTS.ITEM_LISTED, 5);
  assert.strictEqual(POINTS.RATING_GIVEN, 2);
  // Object.freeze prevents reassignment in strict mode (test files run strict).
  assert.strictEqual(Object.isFrozen(POINTS), true);
});

test("formatRelativeDate handles minutes, hours and absolute dates", () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60_000);
  assert.match(formatRelativeDate(tenMinutesAgo), /minute/);

  const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000);
  assert.match(formatRelativeDate(twoHoursAgo), /hour/);

  const oldDate = new Date("2020-01-15T00:00:00Z");
  assert.match(formatRelativeDate(oldDate), /2020/);

  assert.strictEqual(formatRelativeDate(null), "Recently added");
});

test("buildGallery falls back to a placeholder when nothing is set", () => {
  const fallback = buildGallery({});
  assert.strictEqual(fallback.length, 1);

  const populated = buildGallery({
    image_path: "/a.jpg",
    gallery_image_2: "/b.jpg",
    gallery_image_3: null
  });
  assert.deepStrictEqual(populated, ["/a.jpg", "/b.jpg"]);
});
