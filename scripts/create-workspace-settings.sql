BEGIN;

CREATE TABLE IF NOT EXISTS workspace_settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  company jsonb NOT NULL DEFAULT '{}'::jsonb,
  security jsonb NOT NULL DEFAULT '{}'::jsonb,
  notifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  inventory_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  appearance jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO workspace_settings (
  id,
  profile,
  company,
  security,
  notifications,
  inventory_rules,
  appearance
)
VALUES (
  'singleton',
  '{"fullName":"Maya Chen","email":"maya@simventory.com"}'::jsonb,
  '{"companyName":"Simventory Retail Group","businessAddress":"24 Makati Avenue, Makati City, Metro Manila","currency":"PHP","timezone":"Asia/Manila"}'::jsonb,
  '{"twoFactor":true,"requireSessionConfirm":true}'::jsonb,
  '{"lowStock":true,"sales":true,"inventory":true,"email":false}'::jsonb,
  '{"reorderLevel":12,"lowStockThreshold":8,"autoDeduct":true,"skuFormat":"SKU-{category}-{number}"}'::jsonb,
  '{"themeMode":"light","density":"comfortable","accent":"teal"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  profile = EXCLUDED.profile,
  company = EXCLUDED.company,
  security = EXCLUDED.security,
  notifications = EXCLUDED.notifications,
  inventory_rules = EXCLUDED.inventory_rules,
  appearance = EXCLUDED.appearance,
  updated_at = NOW();

COMMIT;