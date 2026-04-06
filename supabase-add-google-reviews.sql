-- Add google_reviews column to store individual reviews from Google Places API
ALTER TABLE quiosques ADD COLUMN IF NOT EXISTS google_reviews JSONB DEFAULT '[]';
