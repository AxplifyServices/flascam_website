\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE regional_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    acronym VARCHAR(40),

    region VARCHAR(180) NOT NULL,
    city VARCHAR(180),

    member_count INTEGER,
    affiliated_since_year INTEGER,

    logo_media_asset_id UUID,
    logo_text VARCHAR(12),

    presentation TEXT,

    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website_url TEXT,

    facebook_url TEXT,
    instagram_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,

    seo_title VARCHAR(255),
    seo_description VARCHAR(320),

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT regional_associations_logo_media_asset_id_fkey
        FOREIGN KEY (logo_media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE SET NULL,

    CONSTRAINT regional_associations_status_check
        CHECK (
            status IN (
                'DRAFT',
                'SUBMITTED',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT regional_associations_member_count_check
        CHECK (
            member_count IS NULL
            OR member_count >= 0
        ),

    CONSTRAINT regional_associations_affiliated_since_year_check
        CHECK (
            affiliated_since_year IS NULL
            OR affiliated_since_year BETWEEN 1900 AND 2100
        )
);

ALTER TABLE users
ADD COLUMN regional_association_id UUID;

ALTER TABLE users
ADD CONSTRAINT users_regional_association_id_fkey
FOREIGN KEY (regional_association_id)
REFERENCES regional_associations(id)
ON DELETE SET NULL;

CREATE TABLE association_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    regional_association_id UUID NOT NULL,

    content_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(180) NOT NULL,

    excerpt TEXT,
    body TEXT,

    cover_media_asset_id UUID,

    event_start_at TIMESTAMPTZ,
    event_end_at TIMESTAMPTZ,
    event_location VARCHAR(255),

    display_order INTEGER NOT NULL DEFAULT 0,

    seo_title VARCHAR(255),
    seo_description VARCHAR(320),

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT association_posts_regional_association_id_fkey
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE CASCADE,

    CONSTRAINT association_posts_cover_media_asset_id_fkey
        FOREIGN KEY (cover_media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE SET NULL,

    CONSTRAINT association_posts_content_type_check
        CHECK (
            content_type IN (
                'ACTUALITY',
                'EVENT'
            )
        ),

    CONSTRAINT association_posts_status_check
        CHECK (
            status IN (
                'DRAFT',
                'SUBMITTED',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT association_posts_slug_unique
        UNIQUE (regional_association_id, slug)
);

CREATE TABLE association_media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    regional_association_id UUID NOT NULL,
    media_asset_id UUID NOT NULL,

    media_type VARCHAR(30) NOT NULL,

    title VARCHAR(255),
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,

    is_published BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT association_media_items_regional_association_id_fkey
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE CASCADE,

    CONSTRAINT association_media_items_media_asset_id_fkey
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT,

    CONSTRAINT association_media_items_media_type_check
        CHECK (
            media_type IN (
                'PHOTO',
                'VIDEO'
            )
        )
);

CREATE INDEX regional_associations_status_idx
    ON regional_associations(status);

CREATE INDEX regional_associations_deleted_at_idx
    ON regional_associations(deleted_at);

CREATE INDEX regional_associations_featured_order_idx
    ON regional_associations(is_featured, display_order);

CREATE INDEX regional_associations_region_idx
    ON regional_associations(region);

CREATE INDEX association_posts_association_idx
    ON association_posts(regional_association_id);

CREATE INDEX association_posts_type_status_idx
    ON association_posts(content_type, status);

CREATE INDEX association_posts_event_start_idx
    ON association_posts(event_start_at);

CREATE INDEX association_posts_deleted_at_idx
    ON association_posts(deleted_at);

CREATE INDEX association_media_items_association_idx
    ON association_media_items(regional_association_id);

CREATE INDEX association_media_items_type_idx
    ON association_media_items(media_type);

CREATE INDEX association_media_items_deleted_at_idx
    ON association_media_items(deleted_at);

CREATE INDEX users_regional_association_id_idx
    ON users(regional_association_id);

INSERT INTO permissions (
    code,
    name,
    description
)
VALUES
    (
        'associations.read',
        'Consulter les associations',
        'Consulter les associations régionales dans le back-office.'
    ),
    (
        'associations.manage',
        'Gérer les associations',
        'Créer, modifier, publier et administrer les associations régionales.'
    )
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions
    ON permissions.code IN (
        'associations.read',
        'associations.manage'
    )
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN'
)
ON CONFLICT DO NOTHING;

COMMIT;