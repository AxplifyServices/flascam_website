BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Renommage fonctionnel du rôle existant
-- ============================================================

UPDATE roles
SET
    name = 'Adhérent non votant',
    description = 'Adhérent autorisé à consulter la marketplace et à envoyer des offres après validation de sa caution.',
    is_system = TRUE,
    updated_at = NOW()
WHERE code = 'MARKETPLACE_USER';

-- Le code technique MARKETPLACE_USER est volontairement conservé
-- pour ne pas casser les comptes, guards et permissions existants.

-- ============================================================
-- 2. Permissions de gestion
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
    'non_voting_adherents.read',
    'Consulter les adhérents non votants',
    'Consulter les comptes, dossiers et statuts de caution des adhérents non votants.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'non_voting_adherents.manage',
    'Gérer les adhérents non votants',
    'Créer, modifier, valider, refuser, suspendre et réactiver les adhérents non votants.',
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
CROSS JOIN permissions
WHERE roles.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN'
)
AND permissions.code IN (
    'non_voting_adherents.read',
    'non_voting_adherents.manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 3. Dossiers des adhérents non votants
-- ============================================================

CREATE TABLE non_voting_adherents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    city VARCHAR(180) NOT NULL,

    membership_status VARCHAR(30) NOT NULL
        DEFAULT 'PENDING_PAYMENT',

    deposit_payment_method VARCHAR(30) NOT NULL,

    deposit_status VARCHAR(30) NOT NULL
        DEFAULT 'PENDING',

    deposit_amount NUMERIC(14, 2) NOT NULL,

    currency_code CHAR(3) NOT NULL
        DEFAULT 'MAD',

    wafacash_reference VARCHAR(180),

    payment_provider VARCHAR(80),
    payment_session_id VARCHAR(255),
    payment_transaction_id VARCHAR(255),

    payment_requested_at TIMESTAMPTZ,
    payment_submitted_at TIMESTAMPTZ,
    payment_confirmed_at TIMESTAMPTZ,
    payment_rejected_at TIMESTAMPTZ,
    payment_refunded_at TIMESTAMPTZ,

    rejection_reason TEXT,
    suspension_reason TEXT,

    created_by_user_id UUID NOT NULL,
    reviewed_by_user_id UUID,

    reviewed_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT non_voting_adherents_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT non_voting_adherents_created_by_fk
        FOREIGN KEY (created_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT non_voting_adherents_reviewed_by_fk
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT non_voting_adherents_user_unique
        UNIQUE (user_id),

    CONSTRAINT non_voting_adherents_membership_status_check
        CHECK (
            membership_status IN (
                'PENDING_PAYMENT',
                'PENDING_REVIEW',
                'ACTIVE',
                'REJECTED',
                'SUSPENDED'
            )
        ),

    CONSTRAINT non_voting_adherents_payment_method_check
        CHECK (
            deposit_payment_method IN (
                'CARD',
                'WAFACASH'
            )
        ),

    CONSTRAINT non_voting_adherents_deposit_status_check
        CHECK (
            deposit_status IN (
                'PENDING',
                'SUBMITTED',
                'PAID',
                'REJECTED',
                'REFUNDED'
            )
        ),

    CONSTRAINT non_voting_adherents_amount_check
        CHECK (
            deposit_amount > 0
        ),

    CONSTRAINT non_voting_adherents_currency_check
        CHECK (
            currency_code = 'MAD'
        ),

    CONSTRAINT non_voting_adherents_city_not_blank
        CHECK (
            LENGTH(TRIM(city)) > 0
        ),

    CONSTRAINT non_voting_adherents_wafacash_reference_check
        CHECK (
            wafacash_reference IS NULL
            OR LENGTH(TRIM(wafacash_reference)) > 0
        ),

    CONSTRAINT non_voting_adherents_payment_method_data_check
        CHECK (
            (
                deposit_payment_method = 'CARD'
                AND wafacash_reference IS NULL
            )
            OR
            (
                deposit_payment_method = 'WAFACASH'
            )
        ),

    CONSTRAINT non_voting_adherents_active_payment_check
        CHECK (
            membership_status <> 'ACTIVE'
            OR (
                deposit_status = 'PAID'
                AND payment_confirmed_at IS NOT NULL
                AND activated_at IS NOT NULL
            )
        ),

    CONSTRAINT non_voting_adherents_pending_review_check
        CHECK (
            membership_status <> 'PENDING_REVIEW'
            OR (
                deposit_payment_method = 'WAFACASH'
                AND deposit_status = 'SUBMITTED'
                AND wafacash_reference IS NOT NULL
                AND payment_submitted_at IS NOT NULL
            )
        ),

    CONSTRAINT non_voting_adherents_rejected_check
        CHECK (
            membership_status <> 'REJECTED'
            OR (
                deposit_status = 'REJECTED'
                AND payment_rejected_at IS NOT NULL
                AND rejection_reason IS NOT NULL
                AND LENGTH(TRIM(rejection_reason)) > 0
            )
        ),

    CONSTRAINT non_voting_adherents_suspended_check
        CHECK (
            membership_status <> 'SUSPENDED'
            OR (
                suspended_at IS NOT NULL
                AND suspension_reason IS NOT NULL
                AND LENGTH(TRIM(suspension_reason)) > 0
            )
        )
);

CREATE UNIQUE INDEX non_voting_adherents_wafacash_reference_unique
ON non_voting_adherents (
    wafacash_reference
)
WHERE wafacash_reference IS NOT NULL
AND deleted_at IS NULL;

CREATE UNIQUE INDEX non_voting_adherents_payment_session_unique
ON non_voting_adherents (
    payment_session_id
)
WHERE payment_session_id IS NOT NULL
AND deleted_at IS NULL;

CREATE UNIQUE INDEX non_voting_adherents_payment_transaction_unique
ON non_voting_adherents (
    payment_transaction_id
)
WHERE payment_transaction_id IS NOT NULL
AND deleted_at IS NULL;

CREATE INDEX non_voting_adherents_membership_status_idx
ON non_voting_adherents (
    membership_status,
    created_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX non_voting_adherents_deposit_status_idx
ON non_voting_adherents (
    deposit_status,
    created_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX non_voting_adherents_payment_method_idx
ON non_voting_adherents (
    deposit_payment_method,
    created_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX non_voting_adherents_created_by_idx
ON non_voting_adherents (
    created_by_user_id,
    created_at DESC
);

CREATE INDEX non_voting_adherents_reviewed_by_idx
ON non_voting_adherents (
    reviewed_by_user_id,
    reviewed_at DESC
)
WHERE reviewed_by_user_id IS NOT NULL;

COMMENT ON TABLE non_voting_adherents IS
'Dossiers des adhérents non votants autorisés à acheter sur la marketplace après validation de leur caution.';

COMMENT ON COLUMN non_voting_adherents.membership_status IS
'PENDING_PAYMENT, PENDING_REVIEW, ACTIVE, REJECTED ou SUSPENDED.';

COMMENT ON COLUMN non_voting_adherents.deposit_status IS
'PENDING, SUBMITTED, PAID, REJECTED ou REFUNDED.';

COMMENT ON COLUMN non_voting_adherents.wafacash_reference IS
'Référence du transfert Wafacash fournie par l’adhérent et vérifiée manuellement par FLASCAM.';

COMMIT;