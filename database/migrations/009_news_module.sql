\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    content_type VARCHAR(40) NOT NULL,

    event_category VARCHAR(60),

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(180) NOT NULL,

    excerpt TEXT,

    body TEXT,

    event_start_at TIMESTAMPTZ,

    event_end_at TIMESTAMPTZ,

    event_location VARCHAR(255),

    seo_title VARCHAR(255),

    seo_description VARCHAR(320),

    published_at TIMESTAMPTZ,

    created_by_user_id UUID,

    updated_by_user_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    CONSTRAINT news_articles_slug_unique
        UNIQUE (slug),

    CONSTRAINT news_articles_content_type_check
        CHECK (
            content_type IN (
                'ACTUALITY',
                'EVENT',
                'OFFICIAL_RELEASE',
                'REGULATORY_PUBLICATION',
                'PRESS_REVIEW'
            )
        ),

    CONSTRAINT news_articles_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT news_articles_event_category_check
        CHECK (
            event_category IS NULL
            OR event_category IN (
                'SALON_EXPOSITION',
                'CONFERENCE_SOMMET',
                'ASSEMBLEE_INSTITUTIONNELLE',
                'PRESSE_MEDIA',
                'PRIX_CONCOURS',
                'PARTENARIAT',
                'RENCONTRE_INSTITUTIONNELLE',
                'LANCEMENT_AUTOMOBILE',
                'FORMATION_ATELIER',
                'OTHER'
            )
        ),

    CONSTRAINT news_articles_event_start_required_check
        CHECK (
            content_type <> 'EVENT'
            OR event_start_at IS NOT NULL
        ),

    CONSTRAINT news_articles_event_end_check
        CHECK (
            event_end_at IS NULL
            OR event_start_at IS NULL
            OR event_end_at >= event_start_at
        ),

    CONSTRAINT news_articles_event_fields_check
        CHECK (
            content_type = 'EVENT'
            OR (
                event_category IS NULL
                AND event_start_at IS NULL
                AND event_end_at IS NULL
                AND event_location IS NULL
            )
        ),

    CONSTRAINT news_articles_created_by_user_fk
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT news_articles_updated_by_user_fk
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS news_articles_publication_idx
    ON news_articles (
        status,
        published_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS news_articles_content_type_idx
    ON news_articles (
        content_type,
        status,
        published_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS news_articles_event_start_idx
    ON news_articles (
        event_start_at
    )
    WHERE deleted_at IS NULL
      AND content_type = 'EVENT';

CREATE INDEX IF NOT EXISTS news_articles_created_at_idx
    ON news_articles (
        created_at DESC
    );

CREATE INDEX IF NOT EXISTS news_articles_deleted_at_idx
    ON news_articles (
        deleted_at
    );

CREATE TABLE IF NOT EXISTS news_article_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    news_article_id UUID NOT NULL,

    media_asset_id UUID NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0,

    alt_text VARCHAR(255),

    caption TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT news_article_media_article_fk
        FOREIGN KEY (news_article_id)
        REFERENCES news_articles(id)
        ON DELETE CASCADE,

    CONSTRAINT news_article_media_asset_fk
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT,

    CONSTRAINT news_article_media_article_asset_unique
        UNIQUE (
            news_article_id,
            media_asset_id
        ),

    CONSTRAINT news_article_media_display_order_check
        CHECK (
            display_order >= 0
        )
);

CREATE INDEX IF NOT EXISTS news_article_media_order_idx
    ON news_article_media (
        news_article_id,
        display_order ASC,
        created_at ASC
    );

INSERT INTO permissions (
    code,
    name,
    description
)
VALUES (
    'news.manage',
    'Gérer les actualités FLASCAM',
    'Permet de créer, modifier, publier, archiver et supprimer les actualités centrales de FLASCAM.'
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
CROSS JOIN permissions
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN'
)
AND permissions.code = 'news.manage'
ON CONFLICT DO NOTHING;

DELETE FROM role_permissions
USING roles, permissions
WHERE role_permissions.role_id = roles.id
  AND role_permissions.permission_id = permissions.id
  AND roles.code = 'ASSOCIATION_ADMIN'
  AND permissions.code = 'news.manage';

COMMIT;