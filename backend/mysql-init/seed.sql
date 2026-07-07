SET @admin_id = '2480a526-3885-4ea8-91a1-83fae963701c';
SET @admin_profile_id = '64128a33-d550-4622-9959-834eed123773';

INSERT INTO `users` (`id`, `email`, `username`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`)
VALUES (
  @admin_id,
  'admin@localhost',
  'admin',
  '$argon2id$v=19$m=65536,t=3,p=4$Ma5J1i2ah6+2wprTjBsomw$yNW5VDQQAisC993bEvrj9pmSn2tKBZSiRSPyyxBZvNI',
  'ADMIN',
  true,
  NOW(3),
  NOW(3)
);

INSERT INTO `profiles` (`id`, `user_id`, `display_name`, `bio`, `is_private`, `share_location`, `notify_messages`, `notify_likes`, `created_at`, `updated_at`)
VALUES (
  @admin_profile_id,
  @admin_id,
  'Administrateur',
  'Compte administrateur principal',
  false,
  false,
  true,
  true,
  NOW(3),
  NOW(3)
);

INSERT INTO `storage_stats` (`id`, `video_bytes`, `updated_at`)
VALUES ('global', 0, NOW(3));

INSERT INTO `hashtags` (`id`, `name`) VALUES
  (UUID(), 'fyp'),
  (UUID(), 'viral'),
  (UUID(), 'comedie'),
  (UUID(), 'danse'),
  (UUID(), 'musique'),
  (UUID(), 'cuisine'),
  (UUID(), 'sport'),
  (UUID(), 'gaming');