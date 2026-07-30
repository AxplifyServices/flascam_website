BEGIN;

INSERT INTO permissions (
    id,
    code,
    name,
    description,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'association.adherents.suspend',
    'Suspendre un adhérent de son association',
    'Permet à une association de suspendre uniquement un adhérent validé rattaché à son propre périmètre.',
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
WHERE roles.code = 'ASSOCIATION_ADMIN'
AND permissions.code = 'association.adherents.suspend'
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;