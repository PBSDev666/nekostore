UPDATE customers
SET role = 'customer', updated_at = NOW()
WHERE role = 'admin' AND id <> 'admin_neko';

INSERT INTO customers (
  id,
  name,
  email,
  phone,
  password_hash,
  points,
  lifetime_points,
  tier_id,
  tier,
  role,
  is_demo,
  created_at,
  updated_at
) VALUES (
  'admin_neko',
  'Admin NEKO',
  'admin@nekostore.cr',
  '50624247171',
  '$2b$10$iUGcvuDDpqoIJl9G4edCUuxsxdcTbiZvmGrTpJ/LtADaKIZ29MOKi',
  0,
  0,
  'neko_noir',
  'NEKO NOIR',
  'admin',
  FALSE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();
