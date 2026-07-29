BEGIN;

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    regional_association_id UUID NULL,
    news_article_id UUID NULL,

    created_by_user_id UUID NULL,
    updated_by_user_id UUID NULL,
    reviewed_by_user_id UUID NULL,

    media_asset_id UUID NULL,
    thumbnail_media_asset_id UUID NULL,

    source_type VARCHAR(30) NOT NULL DEFAULT 'STANDALONE',
    provider VARCHAR(30) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(180) NOT NULL,

    excerpt TEXT NULL,
    description TEXT NULL,

    external_url TEXT NULL,
    external_video_id VARCHAR(150) NULL,

    duration_seconds NUMERIC(12, 3) NULL,

    seo_title VARCHAR(255) NULL,
    seo_description VARCHAR(320) NULL,

    display_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    published_at TIMESTAMPTZ NULL,
    scheduled_at TIMESTAMPTZ NULL,

    submitted_at TIMESTAMPTZ NULL,
    reviewed_at TIMESTAMPTZ NULL,
    rejection_reason TEXT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL,

    CONSTRAINT videos_slug_unique
        UNIQUE (slug),

    CONSTRAINT videos_association_fk
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT videos_news_article_fk
        FOREIGN KEY (news_article_id)
        REFERENCES news_articles(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT videos_created_by_user_fk
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,

    CONSTRAINT videos_updated_by_user_fk
        FOREIGN KEY (updated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,

    CONSTRAINT videos_reviewed_by_user_fk
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION,

    CONSTRAINT videos_media_asset_fk
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT videos_thumbnail_media_asset_fk
        FOREIGN KEY (thumbnail_media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT videos_source_type_check
        CHECK (
            source_type IN (
                'STANDALONE',
                'NEWS'
            )
        ),

    CONSTRAINT videos_provider_check
        CHECK (
            provider IN (
                'YOUTUBE',
                'UPLOADED'
            )
        ),

    CONSTRAINT videos_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_REVIEW',
                'REJECTED',
                'PUBLISHED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT videos_provider_content_check
        CHECK (
            (
                provider = 'YOUTUBE'
                AND external_url IS NOT NULL
                AND external_video_id IS NOT NULL
                AND media_asset_id IS NULL
            )
            OR
            (
                provider = 'UPLOADED'
                AND media_asset_id IS NOT NULL
                AND external_url IS NULL
                AND external_video_id IS NULL
            )
        ),

    CONSTRAINT videos_news_source_check
        CHECK (
            (
                source_type = 'NEWS'
                AND news_article_id IS NOT NULL
            )
            OR
            (
                source_type = 'STANDALONE'
                AND news_article_id IS NULL
            )
        ),

    CONSTRAINT videos_published_at_check
        CHECK (
            status <> 'PUBLISHED'
            OR published_at IS NOT NULL
        ),

    CONSTRAINT videos_schedule_check
        CHECK (
            scheduled_at IS NULL
            OR status = 'DRAFT'
        ),

    CONSTRAINT videos_review_check
        CHECK (
            (
                status = 'PENDING_REVIEW'
                AND submitted_at IS NOT NULL
            )
            OR status <> 'PENDING_REVIEW'
        )
);

CREATE UNIQUE INDEX videos_news_uploaded_media_unique
    ON videos (
        news_article_id,
        media_asset_id
    )
    WHERE
        deleted_at IS NULL
        AND source_type = 'NEWS'
        AND provider = 'UPLOADED';

CREATE UNIQUE INDEX videos_news_youtube_unique
    ON videos (
        news_article_id,
        external_video_id
    )
    WHERE
        deleted_at IS NULL
        AND source_type = 'NEWS'
        AND provider = 'YOUTUBE';

CREATE INDEX videos_publication_idx
    ON videos (
        status,
        published_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX videos_public_visible_idx
    ON videos (
        published_at DESC,
        created_at DESC
    )
    WHERE
        deleted_at IS NULL
        AND status = 'PUBLISHED'
        AND published_at IS NOT NULL;

CREATE INDEX videos_association_public_idx
    ON videos (
        regional_association_id,
        published_at DESC
    )
    WHERE
        deleted_at IS NULL
        AND status = 'PUBLISHED'
        AND published_at IS NOT NULL;

CREATE INDEX videos_association_admin_idx
    ON videos (
        regional_association_id,
        updated_at DESC
    )
    WHERE deleted_at IS NULL;

CREATE INDEX videos_news_article_idx
    ON videos (
        news_article_id
    )
    WHERE
        deleted_at IS NULL
        AND news_article_id IS NOT NULL;

CREATE INDEX videos_pending_review_idx
    ON videos (
        submitted_at,
        updated_at DESC
    )
    WHERE
        deleted_at IS NULL
        AND status = 'PENDING_REVIEW';

CREATE INDEX videos_featured_idx
    ON videos (
        display_order,
        published_at DESC
    )
    WHERE
        deleted_at IS NULL
        AND status = 'PUBLISHED'
        AND is_featured = TRUE;

CREATE INDEX videos_scheduled_publication_idx
    ON videos (
        scheduled_at
    )
    WHERE
        deleted_at IS NULL
        AND status = 'DRAFT'
        AND scheduled_at IS NOT NULL;

CREATE INDEX videos_provider_idx
    ON videos (
        provider,
        published_at DESC
    )
    WHERE deleted_at IS NULL;

COMMENT ON TABLE videos IS
    'Vidéos autonomes ou issues des actualités de la FLASCAM et des associations régionales.';

COMMENT ON COLUMN videos.source_type IS
    'STANDALONE pour une publication indépendante, NEWS pour une vidéo provenant d’une actualité.';

COMMENT ON COLUMN videos.provider IS
    'YOUTUBE pour un lien YouTube, UPLOADED pour une vidéo stockée dans MinIO.';

COMMENT ON COLUMN videos.regional_association_id IS
    'NULL pour une vidéo FLASCAM, renseigné pour une vidéo appartenant à une association.';

COMMENT ON COLUMN videos.external_video_id IS
    'Identifiant normalisé de la vidéo YouTube, sans URL complète.';

INSERT INTO permissions (
    id,
    code,
    name,
    description,
    created_at,
    updated_at
)
VALUES
    (
        gen_random_uuid(),
        'videos.manage',
        'Gérer les vidéos',
        'Créer, modifier, valider, publier, archiver et supprimer les vidéos de la FLASCAM et des associations.',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        'association.videos.manage',
        'Gérer les vidéos de son association',
        'Créer, modifier, soumettre, dépublier et supprimer les vidéos appartenant à son association.',
        NOW(),
        NOW()
    )
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO role_permissions (
    role_id,
    permission_id,
    created_at
)
SELECT
    roles.id,
    permissions.id,
    NOW()
FROM roles
INNER JOIN permissions
    ON permissions.code = 'videos.manage'
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN'
)
ON CONFLICT (
    role_id,
    permission_id
) DO NOTHING;

INSERT INTO role_permissions (
    role_id,
    permission_id,
    created_at
)
SELECT
    roles.id,
    permissions.id,
    NOW()
FROM roles
INNER JOIN permissions
    ON permissions.code = 'association.videos.manage'
WHERE roles.code = 'ASSOCIATION_ADMIN'
ON CONFLICT (
    role_id,
    permission_id
) DO NOTHING;

COMMIT;