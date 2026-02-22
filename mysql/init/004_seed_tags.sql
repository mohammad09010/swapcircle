INSERT IGNORE INTO tags (name) VALUES
('Fantasy'),
('Sci-Fi'),
('Rock'),
('Jazz'),
('Textbook'),
('Beginner');

-- Map tags to your existing seed items (items 1..4 from 002_seed.sql)
-- 1 The Hobbit -> Fantasy
-- 2 1984 -> Sci-Fi (or Textbook, your choice)
-- 3 Kind of Blue -> Jazz
-- 4 Abbey Road -> Rock
INSERT IGNORE INTO item_tags (item_id, tag_id) VALUES
(1, 1),
(2, 2),
(3, 4),
(4, 3);
