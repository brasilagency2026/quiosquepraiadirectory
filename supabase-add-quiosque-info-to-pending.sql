-- Add quiosque info columns to pending_registrations
ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS quiosque_name TEXT;
ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS beach_name TEXT;
ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS state TEXT;
