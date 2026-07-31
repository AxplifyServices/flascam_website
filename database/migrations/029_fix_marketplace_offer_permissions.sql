BEGIN;

-- S'assurer que les permissions existent.
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
    'marketplace.offers.create',
    'Créer des demandes marketplace',
    'Envoyer une proposition sur un véhicule publié.',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'marketplace.offers.manage',
    'Gérer les demandes marketplace',
    'Consulter et traiter les demandes envoyées ou reçues.',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Tous les profils autorisés à envoyer une demande.
INSERT INTO role_permissions (
    role_id,
    permission_id,
    created_at
)
SELECT
    r.id,
    p.id,
    NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
    'MARKETPLACE_USER'
)
AND p.code IN (
    'marketplace.offers.create',
    'marketplace.offers.manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;