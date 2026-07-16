BEGIN;

-- 1. Corrige les actualités marquées comme publiées
-- mais dont la date de publication est absente ou future.
UPDATE news_articles
SET
    published_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE
    status = 'PUBLISHED'
    AND deleted_at IS NULL
    AND (
        published_at IS NULL
        OR published_at > CURRENT_TIMESTAMP
    );

-- 2. Nettoie la date de publication des brouillons et archives.
-- Une actualité non publiée ne doit pas conserver une date publique.
UPDATE news_articles
SET
    published_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE
    status IN ('DRAFT', 'ARCHIVED')
    AND published_at IS NOT NULL;

-- 3. Index adapté aux lectures publiques.
CREATE INDEX IF NOT EXISTS news_articles_public_visible_idx
ON news_articles (
    published_at DESC,
    created_at DESC
)
WHERE
    status = 'PUBLISHED'
    AND published_at IS NOT NULL
    AND deleted_at IS NULL;

COMMIT;

SELECT
    id,
    title,
    slug,
    status,
    published_at,
    deleted_at,
    CASE
        WHEN
            status = 'PUBLISHED'
            AND published_at IS NOT NULL
            AND published_at <= CURRENT_TIMESTAMP
            AND deleted_at IS NULL
        THEN 'VISIBLE_PUBLIQUEMENT'
        ELSE 'NON_VISIBLE'
    END AS visibility
FROM news_articles
ORDER BY created_at DESC;