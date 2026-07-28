BEGIN;

ALTER TABLE regional_associations
    ADD COLUMN IF NOT EXISTS map_position_x NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS map_position_y NUMERIC(5, 2),
    ADD COLUMN IF NOT EXISTS map_is_visible BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE regional_associations
    DROP CONSTRAINT IF EXISTS regional_associations_map_position_x_check;

ALTER TABLE regional_associations
    ADD CONSTRAINT regional_associations_map_position_x_check
    CHECK (
        map_position_x IS NULL
        OR (
            map_position_x >= 0
            AND map_position_x <= 100
        )
    );

ALTER TABLE regional_associations
    DROP CONSTRAINT IF EXISTS regional_associations_map_position_y_check;

ALTER TABLE regional_associations
    ADD CONSTRAINT regional_associations_map_position_y_check
    CHECK (
        map_position_y IS NULL
        OR (
            map_position_y >= 0
            AND map_position_y <= 100
        )
    );

CREATE INDEX IF NOT EXISTS regional_associations_public_map_idx
    ON regional_associations (
        map_is_visible,
        display_order,
        name
    )
    WHERE deleted_at IS NULL
      AND status = 'PUBLISHED';

COMMENT ON COLUMN regional_associations.map_position_x IS
    'Position horizontale du point sur la carte du Maroc, exprimée en pourcentage entre 0 et 100.';

COMMENT ON COLUMN regional_associations.map_position_y IS
    'Position verticale du point sur la carte du Maroc, exprimée en pourcentage entre 0 et 100.';

COMMENT ON COLUMN regional_associations.map_is_visible IS
    'Détermine si l’association doit apparaître sur la carte publique.';

COMMIT;