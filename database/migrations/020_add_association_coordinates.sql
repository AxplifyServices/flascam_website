BEGIN;

ALTER TABLE regional_associations
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);

ALTER TABLE regional_associations
    DROP CONSTRAINT IF EXISTS regional_associations_latitude_check;

ALTER TABLE regional_associations
    ADD CONSTRAINT regional_associations_latitude_check
    CHECK (
        latitude IS NULL
        OR (
            latitude >= -90
            AND latitude <= 90
        )
    );

ALTER TABLE regional_associations
    DROP CONSTRAINT IF EXISTS regional_associations_longitude_check;

ALTER TABLE regional_associations
    ADD CONSTRAINT regional_associations_longitude_check
    CHECK (
        longitude IS NULL
        OR (
            longitude >= -180
            AND longitude <= 180
        )
    );

COMMENT ON COLUMN regional_associations.latitude IS
    'Latitude géographique de l’association utilisée pour la carte interactive.';

COMMENT ON COLUMN regional_associations.longitude IS
    'Longitude géographique de l’association utilisée pour la carte interactive.';

CREATE INDEX IF NOT EXISTS regional_associations_public_coordinates_idx
    ON regional_associations (
        map_is_visible,
        latitude,
        longitude
    )
    WHERE deleted_at IS NULL
      AND status = 'PUBLISHED'
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL;

COMMIT;