BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Rôle destiné aux acheteurs ordinaires de la marketplace
-- ============================================================

INSERT INTO roles (
    id,
    code,
    name,
    description,
    is_system,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'MARKETPLACE_USER',
    'Utilisateur marketplace',
    'Compte public permettant de déposer et de suivre des offres sur la marketplace.',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_system = TRUE,
    updated_at = NOW();

-- ============================================================
-- 2. Permissions marketplace
-- ============================================================

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
    'marketplace.listings.create',
    'Créer des annonces marketplace',
    'Créer, modifier, soumettre et retirer ses propres annonces de véhicules.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'marketplace.listings.review',
    'Valider les annonces marketplace',
    'Examiner, valider, refuser, dépublier et administrer les annonces marketplace.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'marketplace.offers.create',
    'Créer des offres marketplace',
    'Déposer et suivre ses propres offres sur les véhicules publiés.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'marketplace.offers.manage',
    'Gérer les offres marketplace',
    'Consulter et traiter les offres envoyées ou reçues dans son propre périmètre.',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================
-- 3. Permissions des vendeurs
-- ============================================================

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
CROSS JOIN permissions
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT'
)
AND permissions.code IN (
    'marketplace.listings.create',
    'marketplace.offers.create',
    'marketplace.offers.manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 4. Permissions de validation FLASCAM
-- ============================================================

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
CROSS JOIN permissions
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN'
)
AND permissions.code = 'marketplace.listings.review'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 5. Permissions des acheteurs ordinaires
-- ============================================================

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
CROSS JOIN permissions
WHERE roles.code = 'MARKETPLACE_USER'
AND permissions.code IN (
    'marketplace.offers.create',
    'marketplace.offers.manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 6. Annonces de véhicules
-- ============================================================

CREATE TABLE marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reference VARCHAR(30) NOT NULL,
    slug VARCHAR(180) NOT NULL,

    owner_user_id UUID NOT NULL,

    seller_type VARCHAR(30) NOT NULL,
    regional_association_id UUID,
    adherent_id UUID,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    title VARCHAR(255) NOT NULL,
    description TEXT,

    vehicle_type VARCHAR(50) NOT NULL DEFAULT 'CAR',
    brand VARCHAR(120) NOT NULL,
    model VARCHAR(160) NOT NULL,
    version VARCHAR(160),

    registration_year SMALLINT NOT NULL,
    first_registration_date DATE,

    mileage_km INTEGER NOT NULL,

    fuel_type VARCHAR(40) NOT NULL,
    transmission VARCHAR(40) NOT NULL,

    fiscal_power SMALLINT,
    engine_power_hp SMALLINT,
    engine_capacity_cc INTEGER,

    body_type VARCHAR(60),
    exterior_color VARCHAR(80),
    interior_color VARCHAR(80),

    doors_count SMALLINT,
    seats_count SMALLINT,

    registration_city VARCHAR(180),

    requested_price NUMERIC(14, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'MAD',

    duration_days SMALLINT NOT NULL,

    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by_user_id UUID,
    rejection_reason TEXT,

    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    sold_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,

    seo_title VARCHAR(255),
    seo_description VARCHAR(320),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT marketplace_listings_reference_unique
        UNIQUE (reference),

    CONSTRAINT marketplace_listings_slug_unique
        UNIQUE (slug),

    CONSTRAINT marketplace_listings_owner_fk
        FOREIGN KEY (owner_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listings_association_fk
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listings_adherent_fk
        FOREIGN KEY (adherent_id)
        REFERENCES adherents(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listings_reviewed_by_fk
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listings_seller_type_check
        CHECK (
            seller_type IN (
                'FLASCAM',
                'ASSOCIATION',
                'ADHERENT'
            )
        ),

    CONSTRAINT marketplace_listings_seller_scope_check
        CHECK (
            (
                seller_type = 'FLASCAM'
                AND regional_association_id IS NULL
                AND adherent_id IS NULL
            )
            OR
            (
                seller_type = 'ASSOCIATION'
                AND regional_association_id IS NOT NULL
                AND adherent_id IS NULL
            )
            OR
            (
                seller_type = 'ADHERENT'
                AND regional_association_id IS NOT NULL
                AND adherent_id IS NOT NULL
            )
        ),

    CONSTRAINT marketplace_listings_status_check
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_REVIEW',
                'PUBLISHED',
                'REJECTED',
                'WITHDRAWN',
                'EXPIRED',
                'SOLD'
            )
        ),

    CONSTRAINT marketplace_listings_vehicle_type_check
        CHECK (
            vehicle_type IN (
                'CAR',
                'UTILITY',
                'TRUCK',
                'MINIBUS',
                'OTHER'
            )
        ),

    CONSTRAINT marketplace_listings_fuel_type_check
        CHECK (
            fuel_type IN (
                'DIESEL',
                'PETROL',
                'HYBRID',
                'PLUG_IN_HYBRID',
                'ELECTRIC',
                'LPG',
                'OTHER'
            )
        ),

    CONSTRAINT marketplace_listings_transmission_check
        CHECK (
            transmission IN (
                'MANUAL',
                'AUTOMATIC',
                'SEMI_AUTOMATIC'
            )
        ),

    CONSTRAINT marketplace_listings_duration_check
        CHECK (
            duration_days BETWEEN 1 AND 30
        ),

    CONSTRAINT marketplace_listings_price_check
        CHECK (
            requested_price > 0
        ),

    CONSTRAINT marketplace_listings_mileage_check
        CHECK (
            mileage_km >= 0
        ),

    CONSTRAINT marketplace_listings_registration_year_check
        CHECK (
            registration_year BETWEEN 1900
            AND EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1
        ),

    CONSTRAINT marketplace_listings_title_not_blank
        CHECK (
            LENGTH(TRIM(title)) > 0
        ),

    CONSTRAINT marketplace_listings_brand_not_blank
        CHECK (
            LENGTH(TRIM(brand)) > 0
        ),

    CONSTRAINT marketplace_listings_model_not_blank
        CHECK (
            LENGTH(TRIM(model)) > 0
        ),

    CONSTRAINT marketplace_listings_currency_check
        CHECK (
            currency_code = 'MAD'
        ),

    CONSTRAINT marketplace_listings_review_consistency_check
        CHECK (
            (
                status IN (
                    'DRAFT',
                    'PENDING_REVIEW'
                )
                AND reviewed_at IS NULL
                AND reviewed_by_user_id IS NULL
            )
            OR
            (
                status IN (
                    'PUBLISHED',
                    'REJECTED',
                    'WITHDRAWN',
                    'EXPIRED',
                    'SOLD'
                )
            )
        ),

    CONSTRAINT marketplace_listings_publication_dates_check
        CHECK (
            (
                status <> 'PUBLISHED'
            )
            OR
            (
                published_at IS NOT NULL
                AND expires_at IS NOT NULL
                AND expires_at > published_at
            )
        )
);

CREATE INDEX marketplace_listings_public_idx
ON marketplace_listings (
    published_at DESC,
    created_at DESC
)
WHERE deleted_at IS NULL
AND status = 'PUBLISHED';

CREATE INDEX marketplace_listings_expiration_idx
ON marketplace_listings (expires_at)
WHERE deleted_at IS NULL
AND status = 'PUBLISHED';

CREATE INDEX marketplace_listings_owner_idx
ON marketplace_listings (
    owner_user_id,
    updated_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX marketplace_listings_association_idx
ON marketplace_listings (
    regional_association_id,
    updated_at DESC
)
WHERE deleted_at IS NULL
AND regional_association_id IS NOT NULL;

CREATE INDEX marketplace_listings_adherent_idx
ON marketplace_listings (
    adherent_id,
    updated_at DESC
)
WHERE deleted_at IS NULL
AND adherent_id IS NOT NULL;

CREATE INDEX marketplace_listings_review_queue_idx
ON marketplace_listings (
    submitted_at,
    created_at
)
WHERE deleted_at IS NULL
AND status = 'PENDING_REVIEW';

CREATE INDEX marketplace_listings_vehicle_search_idx
ON marketplace_listings (
    brand,
    model,
    registration_year,
    requested_price
)
WHERE deleted_at IS NULL
AND status = 'PUBLISHED';

-- ============================================================
-- 7. Médias des annonces
-- ============================================================

CREATE TABLE marketplace_listing_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    marketplace_listing_id UUID NOT NULL,
    media_asset_id UUID NOT NULL,

    media_kind VARCHAR(20) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,

    alt_text VARCHAR(255),
    caption TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT marketplace_listing_media_listing_fk
        FOREIGN KEY (marketplace_listing_id)
        REFERENCES marketplace_listings(id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listing_media_asset_fk
        FOREIGN KEY (media_asset_id)
        REFERENCES media_assets(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_listing_media_unique
        UNIQUE (
            marketplace_listing_id,
            media_asset_id
        ),

    CONSTRAINT marketplace_listing_media_kind_check
        CHECK (
            media_kind IN (
                'IMAGE',
                'VIDEO'
            )
        ),

    CONSTRAINT marketplace_listing_media_order_check
        CHECK (
            display_order >= 0
        )
);

CREATE INDEX marketplace_listing_media_order_idx
ON marketplace_listing_media (
    marketplace_listing_id,
    display_order,
    created_at
);

-- Une annonce ne peut contenir qu'une seule vidéo importée.
CREATE UNIQUE INDEX marketplace_listing_media_single_video_idx
ON marketplace_listing_media (marketplace_listing_id)
WHERE media_kind = 'VIDEO';

-- ============================================================
-- 8. Offres déposées par les acheteurs
-- ============================================================

CREATE TABLE marketplace_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    marketplace_listing_id UUID NOT NULL,
    buyer_user_id UUID NOT NULL,

    amount NUMERIC(14, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'MAD',

    message TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT marketplace_offers_listing_fk
        FOREIGN KEY (marketplace_listing_id)
        REFERENCES marketplace_listings(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_offers_buyer_fk
        FOREIGN KEY (buyer_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_offers_status_check
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'CANCELLED'
            )
        ),

    CONSTRAINT marketplace_offers_amount_check
        CHECK (
            amount > 0
        ),

    CONSTRAINT marketplace_offers_currency_check
        CHECK (
            currency_code = 'MAD'
        ),

    CONSTRAINT marketplace_offers_response_check
        CHECK (
            (
                status = 'PENDING'
                AND responded_at IS NULL
                AND cancelled_at IS NULL
            )
            OR
            (
                status IN (
                    'ACCEPTED',
                    'REJECTED'
                )
                AND responded_at IS NOT NULL
                AND cancelled_at IS NULL
            )
            OR
            (
                status = 'CANCELLED'
                AND cancelled_at IS NOT NULL
            )
        )
);

CREATE INDEX marketplace_offers_buyer_idx
ON marketplace_offers (
    buyer_user_id,
    submitted_at DESC
);

CREATE INDEX marketplace_offers_listing_idx
ON marketplace_offers (
    marketplace_listing_id,
    submitted_at DESC
);

CREATE INDEX marketplace_offers_pending_idx
ON marketplace_offers (
    marketplace_listing_id,
    submitted_at
)
WHERE status = 'PENDING';

-- Un acheteur ne peut avoir qu'une offre en attente
-- sur la même annonce.
CREATE UNIQUE INDEX marketplace_offers_one_pending_per_buyer_idx
ON marketplace_offers (
    marketplace_listing_id,
    buyer_user_id
)
WHERE status = 'PENDING';

-- Protection contre deux acceptations simultanées.
CREATE UNIQUE INDEX marketplace_offers_one_accepted_per_listing_idx
ON marketplace_offers (marketplace_listing_id)
WHERE status = 'ACCEPTED';

-- ============================================================
-- 9. Dossier créé après acceptation d'une offre
-- ============================================================

CREATE TABLE marketplace_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    marketplace_listing_id UUID NOT NULL,
    marketplace_offer_id UUID NOT NULL,

    seller_user_id UUID NOT NULL,
    buyer_user_id UUID NOT NULL,

    seller_first_name VARCHAR(100),
    seller_last_name VARCHAR(100),
    seller_email VARCHAR(255) NOT NULL,
    seller_phone VARCHAR(30),

    buyer_first_name VARCHAR(100),
    buyer_last_name VARCHAR(100),
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(30),

    accepted_amount NUMERIC(14, 2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'MAD',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT marketplace_deals_listing_fk
        FOREIGN KEY (marketplace_listing_id)
        REFERENCES marketplace_listings(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_deals_offer_fk
        FOREIGN KEY (marketplace_offer_id)
        REFERENCES marketplace_offers(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_deals_seller_fk
        FOREIGN KEY (seller_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_deals_buyer_fk
        FOREIGN KEY (buyer_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT marketplace_deals_listing_unique
        UNIQUE (marketplace_listing_id),

    CONSTRAINT marketplace_deals_offer_unique
        UNIQUE (marketplace_offer_id),

    CONSTRAINT marketplace_deals_amount_check
        CHECK (
            accepted_amount > 0
        ),

    CONSTRAINT marketplace_deals_currency_check
        CHECK (
            currency_code = 'MAD'
        )
);

CREATE INDEX marketplace_deals_seller_idx
ON marketplace_deals (
    seller_user_id,
    created_at DESC
);

CREATE INDEX marketplace_deals_buyer_idx
ON marketplace_deals (
    buyer_user_id,
    created_at DESC
);

COMMENT ON TABLE marketplace_listings IS
'Annonces anonymes de véhicules soumises à validation par la FLASCAM.';

COMMENT ON COLUMN marketplace_listings.owner_user_id IS
'Compte propriétaire de l’annonce. Cette information ne doit jamais être exposée dans les réponses publiques.';

COMMENT ON COLUMN marketplace_listings.duration_days IS
'Durée choisie par le vendeur entre 1 et 30 jours. Le décompte commence lors de la publication.';

COMMENT ON TABLE marketplace_offers IS
'Offres anonymes envoyées aux propriétaires des annonces marketplace.';

COMMENT ON TABLE marketplace_deals IS
'Instantané des coordonnées échangées après acceptation d’une offre. Accessible uniquement au vendeur et à l’acheteur concernés.';

COMMIT;