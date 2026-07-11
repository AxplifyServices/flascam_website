BEGIN;

ALTER TABLE regional_associations
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMIT;