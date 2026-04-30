DROP TABLE IF EXISTS recent_swaps;
DROP TABLE IF EXISTS item_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  display_name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  avatar_path VARCHAR(255) DEFAULT NULL,
  bio TEXT,
  location_text VARCHAR(120) DEFAULT NULL,
  badge_label VARCHAR(80) DEFAULT NULL,
  joined_at DATE NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.8,
  swaps_completed INT DEFAULT 0,
  is_verified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author_artist VARCHAR(200) NOT NULL,
  item_type ENUM('book','record') NOT NULL,
  condition_note VARCHAR(100) DEFAULT '',
  description TEXT,
  image_path VARCHAR(255) DEFAULT NULL,
  gallery_image_2 VARCHAR(255) DEFAULT NULL,
  gallery_image_3 VARCHAR(255) DEFAULT NULL,
  gallery_image_4 VARCHAR(255) DEFAULT NULL,
  gallery_image_5 VARCHAR(255) DEFAULT NULL,
  location_text VARCHAR(120) DEFAULT NULL,
  owner_user_id INT NOT NULL,
  is_featured TINYINT(1) DEFAULT 0,
  is_available TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_items_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id)
);

CREATE TABLE tags (
  tag_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  cover_image_path VARCHAR(255) DEFAULT NULL
);

CREATE TABLE item_tags (
  item_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (item_id, tag_id),
  CONSTRAINT fk_item_tags_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  CONSTRAINT fk_item_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE recent_swaps (
  swap_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(200) DEFAULT NULL,
  image_path VARCHAR(255) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
