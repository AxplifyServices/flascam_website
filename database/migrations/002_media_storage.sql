\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    uploaded_by_user_id UUID,

    storage_provider VARCHAR(30)
        NOT NULL
        DEFAULT 'S3',

    bucket_name VARCHAR(100)
        NOT NULL,

    object_key TEXT
        NOT NULL,

    original_filename TEXT
        NOT NULL,

    stored_filename TEXT
        NOT NULL,

    file_extension VARCHAR(20),

    mime_type VARCHAR(150)
        NOT NULL,

    media_type VARCHAR(30)
        NOT NULL,

    visibility VARCHAR(20)
        NOT NULL
        DEFAULT 'PRIVATE',

    status VARCHAR(30)
        NOT NULL
        DEFAULT 'PENDING',

    size_bytes BIGINT
        NOT NULL,

    checksum_sha256 VARCHAR(64),

    width INTEGER,
    height INTEGER,

    duration_seconds NUMERIC(12, 3),

    title VARCHAR(255),
    alt_text VARCHAR(255),
    caption TEXT,

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::JSONB,

    uploaded_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    validated_at TIMESTAMPTZ,

    deleted_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT media_assets_uploaded_by_user_id_fkey
        FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT media_assets_bucket_object_unique
        UNIQUE (bucket_name, object_key),

    CONSTRAINT media_assets_storage_provider_check
        CHECK (
            storage_provider IN (
                'S3',
                'MINIO'
            )
        ),

    CONSTRAINT media_assets_media_type_check
        CHECK (
            media_type IN (
                'IMAGE',
                'VIDEO',
                'DOCUMENT',
                'AUDIO',
                'OTHER'
            )
        ),

    CONSTRAINT media_assets_visibility_check
        CHECK (
            visibility IN (
                'PUBLIC',
                'PRIVATE'
            )
        ),

    CONSTRAINT media_assets_status_check
        CHECK (
            status IN (
                'PENDING',
                'UPLOADED',
                'VALIDATED',
                'REJECTED',
                'PUBLISHED',
                'ARCHIVED',
                'DELETED'
            )
        ),

    CONSTRAINT media_assets_size_bytes_check
        CHECK (size_bytes >= 0),

    CONSTRAINT media_assets_width_check
        CHECK (
            width IS NULL
            OR width > 0
        ),

    CONSTRAINT media_assets_height_check
        CHECK (
            height IS NULL
            OR height > 0
        ),

    CONSTRAINT media_assets_duration_check
        CHECK (
            duration_seconds IS NULL
            OR duration_seconds >= 0
        )
);

CREATE INDEX media_assets_uploaded_by_user_id_idx
    ON media_assets(uploaded_by_user_id);

CREATE INDEX media_assets_media_type_idx
    ON media_assets(media_type);

CREATE INDEX media_assets_visibility_idx
    ON media_assets(visibility);

CREATE INDEX media_assets_status_idx
    ON media_assets(status);

CREATE INDEX media_assets_created_at_idx
    ON media_assets(created_at DESC);

CREATE INDEX media_assets_deleted_at_idx
    ON media_assets(deleted_at);

CREATE INDEX media_assets_metadata_gin_idx
    ON media_assets
    USING GIN(metadata);

COMMENT ON TABLE media_assets IS
    'Métadonnées des images, vidéos, documents et autres fichiers stockés dans MinIO ou S3.';

COMMENT ON COLUMN media_assets.object_key IS
    'Chemin unique de l’objet dans le bucket S3.';

COMMENT ON COLUMN media_assets.checksum_sha256 IS
    'Empreinte SHA-256 permettant de contrôler l’intégrité et les doublons.';

COMMENT ON COLUMN media_assets.metadata IS
    'Métadonnées complémentaires propres au type de fichier.';

COMMIT;