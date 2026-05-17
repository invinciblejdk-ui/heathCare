-- Backfill defaults for newly added columns (safe to re-run)
UPDATE onboarding_service.users SET is_active = true WHERE is_active IS NULL;
UPDATE onboarding_service.users SET role = 'USER'     WHERE role IS NULL;

-- Allow mobile-only users (no email required)
ALTER TABLE onboarding_service.users ALTER COLUMN email DROP NOT NULL;

-- Allow email-only users (no mobile required) — make mobile nullable too
ALTER TABLE onboarding_service.users ALTER COLUMN mobile_number DROP NOT NULL;
