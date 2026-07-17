BEGIN;

ALTER TABLE homepage_hero_slides
    ADD COLUMN IF NOT EXISTS desktop_zoom SMALLINT NOT NULL DEFAULT 100,
    ADD COLUMN IF NOT EXISTS mobile_zoom SMALLINT NOT NULL DEFAULT 100;

ALTER TABLE homepage_hero_slides
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_desktop_zoom_check,
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_mobile_zoom_check;

ALTER TABLE homepage_hero_slides
    ADD CONSTRAINT homepage_hero_slides_desktop_zoom_check
        CHECK (desktop_zoom BETWEEN 100 AND 200),
    ADD CONSTRAINT homepage_hero_slides_mobile_zoom_check
        CHECK (mobile_zoom BETWEEN 100 AND 200);

COMMENT ON COLUMN homepage_hero_slides.desktop_zoom
    IS 'Niveau de zoom desktop de l’image du diaporama, entre 100 et 200';

COMMENT ON COLUMN homepage_hero_slides.mobile_zoom
    IS 'Niveau de zoom mobile de l’image du diaporama, entre 100 et 200';

COMMIT;