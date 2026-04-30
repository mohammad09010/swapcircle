-- =============================================================
-- Sprint 4 schema additions
-- Adds authentication, swap workflow, messaging, ratings,
-- favorites and user tag preferences for recommendations.
-- =============================================================

-- 1. Extend the users table for auth and points
ALTER TABLE users
  ADD COLUMN password_hash VARCHAR(255) DEFAULT NULL,
  ADD COLUMN points INT NOT NULL DEFAULT 0,
  ADD COLUMN rating_count INT NOT NULL DEFAULT 0,
  ADD COLUMN rating_sum DECIMAL(8,2) NOT NULL DEFAULT 0;

-- 2. Swap requests
CREATE TABLE swap_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  owner_id INT NOT NULL,
  target_item_id INT NOT NULL,
  offered_item_id INT DEFAULT NULL,
  message TEXT,
  status ENUM('pending','accepted','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_swap_requester FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_swap_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_swap_target FOREIGN KEY (target_item_id) REFERENCES items(item_id) ON DELETE CASCADE,
  CONSTRAINT fk_swap_offered FOREIGN KEY (offered_item_id) REFERENCES items(item_id) ON DELETE SET NULL,
  INDEX idx_swap_owner_status (owner_id, status),
  INDEX idx_swap_requester_status (requester_id, status)
);

-- 3. In-app messages tied to swap conversations
CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  swap_request_id INT NOT NULL,
  sender_id INT NOT NULL,
  body TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_swap FOREIGN KEY (swap_request_id) REFERENCES swap_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_msg_swap (swap_request_id, created_at)
);

-- 4. Ratings (1-5 stars after a completed swap)
CREATE TABLE ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  swap_request_id INT NOT NULL,
  rater_id INT NOT NULL,
  ratee_id INT NOT NULL,
  stars TINYINT NOT NULL,
  comment VARCHAR(500) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_rating (swap_request_id, rater_id),
  CONSTRAINT chk_stars CHECK (stars BETWEEN 1 AND 5),
  CONSTRAINT fk_rating_swap FOREIGN KEY (swap_request_id) REFERENCES swap_requests(request_id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_rater FOREIGN KEY (rater_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_rating_ratee FOREIGN KEY (ratee_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Favourites (saved items)
CREATE TABLE favorites (
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 6. User tag preferences (used by the recommendation engine)
CREATE TABLE user_tag_preferences (
  user_id INT NOT NULL,
  tag_id INT NOT NULL,
  weight INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, tag_id),
  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_pref_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);

-- 7. Notifications (lightweight, populated by the swap & message flows)
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  body VARCHAR(255) NOT NULL,
  link VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read, created_at)
);
