\set ON_ERROR_STOP on

BEGIN;

INSERT INTO permissions (
    code,
    name,
    description
)
VALUES
    (
        'association.profile.read',
        'Consulter sa fiche association',
        'Permet à une association de consulter uniquement sa propre fiche.'
    ),
    (
        'association.profile.update',
        'Modifier sa fiche association',
        'Permet à une association de modifier uniquement les informations autorisées de sa propre fiche.'
    ),
    (
        'association.media.manage',
        'Gérer les médias de son association',
        'Permet à une association d’importer et de gérer uniquement ses propres images et vidéos.'
    ),
    (
        'association.content.manage',
        'Gérer les contenus de son association',
        'Permet à une association de gérer uniquement ses propres actualités et événements.'
    ),
    (
        'association.account.manage',
        'Gérer les comptes des associations',
        'Permet à l’administration FLASCAM de créer et modifier les comptes associés aux associations.'
    ),
    (
        'homepage.manage',
        'Gérer la page d’accueil',
        'Permet de gérer les images, leur publication et leur ordre sur la page d’accueil.'
    )
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Le Super Admin conserve toutes les permissions.
INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    roles.id,
    permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- L’administrateur FLASCAM administre toutes les associations,
-- leurs comptes et la page d’accueil.
INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions
    ON permissions.code IN (
        'associations.read',
        'associations.manage',
        'association.profile.read',
        'association.profile.update',
        'association.media.manage',
        'association.content.manage',
        'association.account.manage',
        'homepage.manage'
    )
WHERE roles.code = 'FLASCAM_ADMIN'
ON CONFLICT DO NOTHING;

-- Suppression des permissions globales qui ne doivent pas appartenir
-- au rôle administrateur d’une association.
DELETE FROM role_permissions
USING roles, permissions
WHERE role_permissions.role_id = roles.id
  AND role_permissions.permission_id = permissions.id
  AND roles.code = 'ASSOCIATION_ADMIN'
  AND permissions.code IN (
      'associations.read',
      'associations.manage',
      'content.manage'
  );

-- Une association ne peut agir que sur son propre périmètre.
INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions
    ON permissions.code IN (
        'association.profile.read',
        'association.profile.update',
        'association.media.manage',
        'association.content.manage'
    )
WHERE roles.code = 'ASSOCIATION_ADMIN'
ON CONFLICT DO NOTHING;

COMMIT;