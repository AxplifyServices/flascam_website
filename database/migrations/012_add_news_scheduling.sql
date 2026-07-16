BEGIN;

ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN news_articles.scheduled_at IS
'Date et heure auxquelles un brouillon doit être automatiquement publié. La valeur est remise à NULL après publication, annulation ou archivage.';

CREATE INDEX IF NOT EXISTS news_articles_scheduled_publication_idx
ON news_articles (scheduled_at ASC)
WHERE
    deleted_at IS NULL
    AND status = 'DRAFT'
    AND scheduled_at IS NOT NULL;

COMMIT;