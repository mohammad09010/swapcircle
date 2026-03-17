INSERT IGNORE INTO tags (name) VALUES
('Fantasy'),
('Sci-Fi'),
('Rock'),
('Jazz'),
('Textbook'),
('Beginner');

INSERT IGNORE INTO item_tags (item_id, tag_id) VALUES
(1, 1),
(2, 2),
(3, 4),
(4, 3),
(5, 6),
(6, 3),
(7, 5),
(8, 4);
