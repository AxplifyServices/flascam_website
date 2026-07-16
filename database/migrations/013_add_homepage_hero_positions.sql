BEGIN;

ALTER TABLE homepage_hero_slides
    ADD COLUMN IF NOT EXISTS desktop_position_x SMALLINT NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS desktop_position_y SMALLINT NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS mobile_position_x SMALLINT NOT NULL DEFAULT 50,
    ADD COLUMN IF NOT EXISTS mobile_position_y SMALLINT NOT NULL DEFAULT 50;

ALTER TABLE homepage_hero_slides
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_desktop_position_x_check,
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_desktop_position_y_check,
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_mobile_position_x_check,
    DROP CONSTRAINT IF EXISTS homepage_hero_slides_mobile_position_y_check;

ALTER TABLE homepage_hero_slides
    ADD CONSTRAINT homepage_hero_slides_desktop_position_x_check
        CHECK (desktop_position_x BETWEEN 0 AND 100),
    ADD CONSTRAINT homepage_hero_slides_desktop_position_y_check
        CHECK (desktop_position_y BETWEEN 0 AND 100),
    ADD CONSTRAINT homepage_hero_slides_mobile_position_x_check
        CHECK (mobile_position_x BETWEEN 0 AND 100),
    ADD CONSTRAINT homepage_hero_slides_mobile_position_y_check
        CHECK (mobile_position_y BETWEEN 0 AND 100);

COMMENT ON COLUMN homepage_hero_slides.desktop_position_x
    IS 'Position horizontale de focalisation desktop, entre 0 et 100';

COMMENT ON COLUMN homepage_hero_slides.desktop_position_y
    IS 'Position verticale de focalisation desktop, entre 0 et 100';

COMMENT ON COLUMN homepage_hero_slides.mobile_position_x
    IS 'Position horizontale de focalisation mobile, entre 0 et 100';

COMMENT ON COLUMN homepage_hero_slides.mobile_position_y
    IS 'Position verticale de focalisation mobile, entre 0 et 100';

COMMIT;