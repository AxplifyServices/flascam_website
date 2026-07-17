BEGIN;

ALTER TABLE news_articles
DROP CONSTRAINT IF EXISTS news_articles_status_check;

ALTER TABLE news_articles
ADD CONSTRAINT news_articles_status_check
CHECK (
    status IN (
        'DRAFT',
        'PENDING_REVIEW',
        'REJECTED',
        'PUBLISHED',
        'ARCHIVED'
    )
);

COMMIT;