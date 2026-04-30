-- =============================================================
-- Sprint 4 seed data
-- Adds login credentials for existing seed users (password is
-- "Password123!" for all demo accounts), starting points,
-- a few sample swap requests, messages, ratings and favourites.
-- =============================================================

-- All five demo users share the same hash for "Password123!".
UPDATE users
SET password_hash = '$2a$10$dDwbUmqhAZC9.yGsch7HM.c3gtuyq5DAS6R.5wdA3PcFITfgq3dn.',
    points = swaps_completed * 10,
    rating_count = 4,
    rating_sum = ROUND(rating * 4, 2);

-- A pending request from Marcus (user 3) for Sarah's Hobbit (item 1)
INSERT INTO swap_requests (requester_id, owner_id, target_item_id, offered_item_id, message, status, created_at)
VALUES (3, 1, 1, 7, 'Hi! I would love to swap my American Gods for your Hobbit.', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- An accepted swap between Alex (2) and David (5) for Design Systems (item 12)
INSERT INTO swap_requests (requester_id, owner_id, target_item_id, offered_item_id, message, status, created_at, updated_at)
VALUES (2, 5, 12, 2, 'Would you trade Design Systems for my Kind of Blue vinyl?', 'accepted',
        DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- A completed swap between Elena (4) and Marcus (3) for Modern Poetry (item 11)
INSERT INTO swap_requests (requester_id, owner_id, target_item_id, offered_item_id, message, status, created_at, updated_at)
VALUES (3, 4, 11, 6, 'Could we trade my Name of the Wind for your poetry collection?', 'completed',
        DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Sample messages on the accepted swap (request_id = 2)
INSERT INTO messages (swap_request_id, sender_id, body, is_read, created_at) VALUES
(2, 2, 'Glad you accepted! Where would you like to meet?', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 5, 'How about the cafe near the central station this Saturday at 11am?', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 'Saturday 11am works for me. I will bring the vinyl in the original sleeve.', 0, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Sample messages on the completed swap (request_id = 3)
INSERT INTO messages (swap_request_id, sender_id, body, is_read, created_at) VALUES
(3, 3, 'Thanks for the swap, the poetry collection is gorgeous!', 1, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(3, 4, 'You are welcome! Enjoy The Name of the Wind too.', 1, DATE_SUB(NOW(), INTERVAL 9 DAY));

-- Ratings tied to the completed swap (request_id = 3)
INSERT INTO ratings (swap_request_id, rater_id, ratee_id, stars, comment, created_at) VALUES
(3, 3, 4, 5, 'Friendly, on-time and the book was in mint condition.', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(3, 4, 3, 5, 'A pleasure to swap with. Very respectful.', DATE_SUB(NOW(), INTERVAL 8 DAY));

-- Sample favourites (saved items) used by the recommender
INSERT INTO favorites (user_id, item_id, created_at) VALUES
(1, 6, DATE_SUB(NOW(), INTERVAL 3 DAY)),  -- Sarah likes Name of the Wind
(2, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),  -- Alex likes The Hobbit
(3, 12, DATE_SUB(NOW(), INTERVAL 4 DAY)), -- Marcus likes Design Systems
(5, 9, DATE_SUB(NOW(), INTERVAL 5 DAY));  -- David likes Mistborn

-- Tag preferences (seeds the recommendation engine for first-time visits)
INSERT INTO user_tag_preferences (user_id, tag_id, weight) VALUES
(1, 1, 3), (1, 2, 2),       -- Sarah  -> Fantasy, Classics
(2, 4, 4), (2, 3, 2),       -- Alex   -> Jazz, Rock
(3, 1, 5), (3, 5, 2),       -- Marcus -> Fantasy, Sci-Fi
(4, 4, 3), (4, 2, 2),       -- Elena  -> Jazz, Classics
(5, 5, 4), (5, 6, 2);       -- David  -> Sci-Fi, Mystery

-- Notifications (one per recipient to demonstrate the bell)
INSERT INTO notifications (user_id, body, link, is_read, created_at) VALUES
(1, 'New swap request from Marcus Chen for The Hobbit', '/my-swaps', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 'David Kim accepted your swap request', '/my-swaps', 0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 'New message from Alex Record', '/my-swaps', 0, DATE_SUB(NOW(), INTERVAL 2 DAY));
