-- Backfill role_keys from legacy role enum
UPDATE users SET role_keys = '["admin"]'  WHERE role = 'admin'  AND role_keys = '[]';
UPDATE users SET role_keys = '["editor"]' WHERE role = 'editor' AND role_keys = '[]';
UPDATE users SET role_keys = '["user"]'   WHERE role = 'user'   AND role_keys = '[]';

-- Verify
SELECT id, email, role, role_keys, status FROM users;
