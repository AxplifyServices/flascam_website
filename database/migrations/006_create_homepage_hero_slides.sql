BEGIN;

CREATE TABLE IF NOT EXISTS homepage_hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    media_asset_id UUID NOT NULL
        REFERENCES media_assets(id)
        ON UPDATE NO ACTION
        ON DELETE RESTRICT,

    title VARCHAR(180),
    alt_text VARCHAR(255) NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT homepage_hero_slides_display_order_check
        CHECK (display_order >= 0)
);

CREATE INDEX IF NOT EXISTS homepage_hero_slides_public_idx
    ON homepage_hero_slides (
        is_published,
        display_order,
        created_at
    );

CREATE UNIQUE INDEX IF NOT EXISTS homepage_hero_slides_media_unique
    ON homepage_hero_slides (media_asset_id);

COMMIT;