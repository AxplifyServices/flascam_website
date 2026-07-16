BEGIN;

ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS regional_association_id UUID NULL,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS reviewed_by_user_id UUID NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'news_articles_regional_association_fk'
    ) THEN
        ALTER TABLE news_articles
        ADD CONSTRAINT news_articles_regional_association_fk
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'news_articles_reviewed_by_user_fk'
    ) THEN
        ALTER TABLE news_articles
        ADD CONSTRAINT news_articles_reviewed_by_user_fk
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE NO ACTION;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS news_articles_association_idx
ON news_articles (
    regional_association_id,
    updated_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS news_articles_association_public_idx
ON news_articles (
    regional_association_id,
    content_type,
    event_start_at,
    published_at DESC
)
WHERE
    deleted_at IS NULL
    AND status = 'PUBLISHED';

CREATE INDEX IF NOT EXISTS news_articles_pending_review_idx
ON news_articles (
    submitted_at ASC,
    updated_at DESC
)
WHERE
    deleted_at IS NULL
    AND status = 'PENDING_REVIEW';

CREATE INDEX IF NOT EXISTS news_articles_reviewer_idx
ON news_articles (reviewed_by_user_id)
WHERE reviewed_by_user_id IS NOT NULL;

COMMENT ON COLUMN news_articles.regional_association_id IS
'Association propriétaire de la publication. NULL pour une publication institutionnelle FLASCAM.';

COMMENT ON COLUMN news_articles.submitted_at IS
'Date à laquelle une association a soumis la publication à validation.';

COMMENT ON COLUMN news_articles.reviewed_at IS
'Date de la dernière décision de validation ou de refus prise par un administrateur FLASCAM.';

COMMENT ON COLUMN news_articles.reviewed_by_user_id IS
'Administrateur FLASCAM ayant validé ou refusé la publication.';

COMMENT ON COLUMN news_articles.rejection_reason IS
'Motif communiqué à l’association lorsque la publication est refusée.';

COMMIT;