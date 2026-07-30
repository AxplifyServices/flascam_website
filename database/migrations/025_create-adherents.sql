BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Nouveau rôle ADHERENT
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
    'ADHERENT',
    'Adhérent',
    'Compte professionnel rattaché à une association régionale.',
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

-- Le rôle ADHERENT ne reçoit volontairement aucune permission.
-- Il peut s'authentifier, mais n'accède à aucun module métier.

-- ============================================================
-- 2. Permissions de gestion des adhérents
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
    'adherents.read',
    'Consulter les adhérents',
    'Consulter l’ensemble des adhérents et les demandes de validation.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'adherents.manage',
    'Gérer les adhérents',
    'Créer, modifier, valider, refuser, suspendre et réactiver les adhérents.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'association.adherents.read',
    'Consulter les adhérents de son association',
    'Consulter uniquement les adhérents rattachés à sa propre association.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'association.adherents.create',
    'Créer un adhérent pour son association',
    'Créer et soumettre à validation un adhérent rattaché à sa propre association.',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================
-- 3. Permissions FLASCAM
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
AND permissions.code IN (
    'adherents.read',
    'adherents.manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 4. Permissions des associations
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
WHERE roles.code = 'ASSOCIATION_ADMIN'
AND permissions.code IN (
    'association.adherents.read',
    'association.adherents.create'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================
-- 5. Table métier des adhérents
-- ============================================================

CREATE TABLE adherents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    regional_association_id UUID NOT NULL,
    user_id UUID NOT NULL,

    display_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),

    member_number VARCHAR(80),

    identifier_type VARCHAR(40),
    identifier_value VARCHAR(120),

    address TEXT,
    city VARCHAR(180),
    postal_code VARCHAR(30),

    notes TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    rejection_reason TEXT,

    submitted_by_user_id UUID NOT NULL,
    reviewed_by_user_id UUID,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT adherents_association_fk
        FOREIGN KEY (regional_association_id)
        REFERENCES regional_associations(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT adherents_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT adherents_submitted_by_fk
        FOREIGN KEY (submitted_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT adherents_reviewed_by_fk
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE NO ACTION,

    CONSTRAINT adherents_user_unique
        UNIQUE (user_id),

    CONSTRAINT adherents_status_check
        CHECK (
            status IN (
                'PENDING',
                'APPROVED',
                'REJECTED',
                'SUSPENDED'
            )
        ),

    CONSTRAINT adherents_identifier_type_check
        CHECK (
            identifier_type IS NULL
            OR identifier_type IN (
                'ICE',
                'IF',
                'RC',
                'CIN',
                'OTHER'
            )
        ),

    CONSTRAINT adherents_display_name_not_blank
        CHECK (
            LENGTH(TRIM(display_name)) > 0
        ),

    CONSTRAINT adherents_review_consistency_check
        CHECK (
            (
                status = 'PENDING'
                AND reviewed_at IS NULL
                AND reviewed_by_user_id IS NULL
            )
            OR
            (
                status <> 'PENDING'
                AND reviewed_at IS NOT NULL
                AND reviewed_by_user_id IS NOT NULL
            )
        )
);

CREATE UNIQUE INDEX adherents_member_number_unique
ON adherents (member_number)
WHERE member_number IS NOT NULL
AND deleted_at IS NULL;

CREATE UNIQUE INDEX adherents_identifier_unique
ON adherents (
    identifier_type,
    identifier_value
)
WHERE identifier_type IS NOT NULL
AND identifier_value IS NOT NULL
AND deleted_at IS NULL;

CREATE INDEX adherents_association_idx
ON adherents (
    regional_association_id,
    status,
    created_at DESC
);

CREATE INDEX adherents_status_idx
ON adherents (
    status,
    submitted_at DESC
);

CREATE INDEX adherents_user_idx
ON adherents (user_id);

CREATE INDEX adherents_submitted_by_idx
ON adherents (submitted_by_user_id);

CREATE INDEX adherents_reviewed_by_idx
ON adherents (reviewed_by_user_id);

CREATE INDEX adherents_deleted_at_idx
ON adherents (deleted_at);

COMMENT ON TABLE adherents IS
'Adhérents professionnels rattachés à une association régionale FLASCAM.';

COMMENT ON COLUMN adherents.status IS
'PENDING, APPROVED, REJECTED ou SUSPENDED.';

COMMENT ON COLUMN adherents.user_id IS
'Compte utilisateur permettant à l’adhérent de se connecter à son espace professionnel.';

COMMIT;