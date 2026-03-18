function formatRelativeDate(input) {
  if (!input) return "Recently added";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Recently added";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatJoinedDate(input) {
  if (!input) return "Joined recently";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Joined recently";

  return `Joined ${date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric"
  })}`;
}

function imageOrFallback(path, fallback) {
  return path || fallback;
}

function buildGallery(item) {
  const gallery = [
    item.image_path,
    item.gallery_image_2,
    item.gallery_image_3,
    item.gallery_image_4
  ].filter(Boolean);

  return gallery.length
    ? gallery
    : ["/public/images/placeholders/category-placeholder.svg"];
}

module.exports = {
  formatRelativeDate,
  formatJoinedDate,
  imageOrFallback,
  buildGallery
};
