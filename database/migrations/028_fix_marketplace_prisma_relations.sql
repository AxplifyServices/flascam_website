BEGIN;

-- ============================================================
-- Prisma interprète mal certains index uniques partiels.
-- Ils font apparaître des relations un-à-un alors que :
-- - une annonce possède plusieurs médias ;
-- - une annonce reçoit plusieurs offres.
--
-- L’unicité métier sera protégée dans le service NestJS
-- avec une transaction et un verrou PostgreSQL.
-- ============================================================

DROP INDEX IF EXISTS marketplace_listing_media_single_video_idx;

DROP INDEX IF EXISTS marketplace_offers_one_pending_per_buyer_idx;

DROP INDEX IF EXISTS marketplace_offers_one_accepted_per_listing_idx;

-- ============================================================
-- Index non uniques conservant de bonnes performances
-- ============================================================

CREATE INDEX IF NOT EXISTS marketplace_listing_media_video_idx
ON marketplace_listing_media (
    marketplace_listing_id,
    media_kind
)
WHERE media_kind = 'VIDEO';

CREATE INDEX IF NOT EXISTS marketplace_offers_buyer_listing_status_idx
ON marketplace_offers (
    marketplace_listing_id,
    buyer_user_id,
    status
);

CREATE INDEX IF NOT EXISTS marketplace_offers_listing_status_idx
ON marketplace_offers (
    marketplace_listing_id,
    status
);

COMMIT;