BEGIN;

ALTER TABLE homepage_hero_slides
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_desktop_zoom_check,
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_mobile_zoom_check;

ALTER TABLE homepage_hero_slides
    ADD CONSTRAINT homepage_hero_slides_desktop_zoom_check
        CHECK (desktop_zoom BETWEEN 25 AND 200),
    ADD CONSTRAINT homepage_hero_slides_mobile_zoom_check
        CHECK (mobile_zoom BETWEEN 25 AND 200);

COMMENT ON COLUMN homepage_hero_slides.desktop_zoom
    IS 'Niveau de zoom desktop de l’image du diaporama, entre 25 et 200';

COMMENT ON COLUMN homepage_hero_slides.mobile_zoom
    IS 'Niveau de zoom mobile de l’image du diaporama, entre 25 et 200';

COMMIT;