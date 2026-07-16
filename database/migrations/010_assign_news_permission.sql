\set ON_ERROR_STOP on

BEGIN;

-- Vérifie que la permission existe avant de l’associer aux rôles.
INSERT INTO permissions (
    code,
    name,
    description,
    created_at,
    updated_at
)
VALUES (
    'news.manage',
    'Gérer les actualités FLASCAM',
    'Permet de créer, modifier, publier, dépublier, archiver et supprimer les actualités centrales de FLASCAM.',
    NOW(),
    NOW()
)
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Associe la permission aux rôles administrateurs existants.
INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM roles AS r
CROSS JOIN permissions AS p
WHERE r.code IN (
    'SUPER_ADMIN',
    'FLASCAM_ADMIN'
)
AND p.code = 'news.manage'
ON CONFLICT DO NOTHING;

-- Retire explicitement cette permission aux administrateurs d’association.
DELETE FROM role_permissions AS rp
USING roles AS r,
      permissions AS p
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND r.code = 'ASSOCIATION_ADMIN'
  AND p.code = 'news.manage';

COMMIT;

-- Vérification du résultat.
SELECT
    r.code AS role_code,
    p.code AS permission_code
FROM role_permissions AS rp
INNER JOIN roles AS r
    ON r.id = rp.role_id
INNER JOIN permissions AS p
    ON p.id = rp.permission_id
WHERE p.code = 'news.manage'
ORDER BY r.code;