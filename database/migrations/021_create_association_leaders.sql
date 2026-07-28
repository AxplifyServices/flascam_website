BEGIN;

CREATE TABLE IF NOT EXISTS association_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    regional_association_id UUID NOT NULL,

    role VARCHAR(40) NOT NULL,

    full_name VARCHAR(180) NOT NULL,

    photo_media_asset_id UUID NULL,

    biography TEXT NULL,

    message TEXT NULL,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT association_leaders_association_fk
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT association_leaders_photo_fk
        FOREIGN KEY (photo_media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,

    CONSTRAINT association_leaders_role_check
        CHECK (
            role IN (
                'PRESIDENT',
                'SECRETARY_GENERAL'
            )
        ),

    CONSTRAINT association_leaders_display_order_check
        CHECK (display_order >= 0),

    CONSTRAINT association_leaders_association_role_unique
        UNIQUE (
            regional_association_id,
            role
        )
);

CREATE INDEX IF NOT EXISTS association_leaders_association_idx
    ON association_leaders (
        regional_association_id
    );

CREATE INDEX IF NOT EXISTS association_leaders_public_idx
    ON association_leaders (
        regional_association_id,
        is_published,
        display_order
    );

COMMENT ON TABLE association_leaders IS
    'Président et secrétaire général présentés sur la page publique d’une association régionale.';

COMMENT ON COLUMN association_leaders.role IS
    'Rôle institutionnel : PRESIDENT ou SECRETARY_GENERAL.';

COMMENT ON COLUMN association_leaders.photo_media_asset_id IS
    'Photo du dirigeant stockée dans media_assets.';

COMMENT ON COLUMN association_leaders.message IS
    'Message institutionnel, utilisé notamment pour le mot du président.';

COMMIT;