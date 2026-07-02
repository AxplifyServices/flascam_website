\set ON_ERROR_STOP on

\if :{?super_admin_email}
\else
  \set super_admin_email 'admin@flascam.ma'
\endif

\if :{?super_admin_password}
\else
  \echo 'ERREUR : fournissez -v super_admin_password="VotreMotDePasseFort"'
  \quit
\endif

\if :{?super_admin_first_name}
\else
  \set super_admin_first_name 'Super'
\endif

\if :{?super_admin_last_name}
\else
  \set super_admin_last_name 'Admin'
\endif

BEGIN;

INSERT INTO permissions (
    code,
    name,
    description
)
VALUES
    (
        'users.read',
        'Consulter les utilisateurs',
        'Consulter la liste et le détail des utilisateurs.'
    ),
    (
        'users.create',
        'Créer des utilisateurs',
        'Créer de nouveaux comptes utilisateurs.'
    ),
    (
        'users.update',
        'Modifier les utilisateurs',
        'Modifier les comptes et leurs statuts.'
    ),
    (
        'users.delete',
        'Supprimer des utilisateurs',
        'Désactiver ou supprimer logiquement un compte.'
    ),
    (
        'roles.read',
        'Consulter les rôles',
        'Consulter les rôles et permissions.'
    ),
    (
        'roles.manage',
        'Gérer les rôles',
        'Créer, modifier et attribuer les rôles.'
    ),
    (
        'audit.read',
        'Consulter les journaux',
        'Consulter les connexions et actions sensibles.'
    ),
    (
        'content.manage',
        'Gérer les contenus',
        'Administrer les contenus publics FLASCAM.'
    ),
    (
        'associations.manage',
        'Gérer les associations',
        'Administrer les associations régionales.'
    ),
    (
        'renters.manage',
        'Gérer les loueurs',
        'Administrer les loueurs affiliés.'
    ),
    (
        'vehicles.manage',
        'Gérer les véhicules',
        'Administrer les annonces de véhicules.'
    ),
    (
        'settings.manage',
        'Gérer les paramètres',
        'Administrer les paramètres globaux de la plateforme.'
    )
ON CONFLICT (code) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

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
        'users.read',
        'users.create',
        'users.update',
        'roles.read',
        'audit.read',
        'content.manage',
        'associations.manage',
        'renters.manage',
        'vehicles.manage'
    )
WHERE roles.code = 'FLASCAM_ADMIN'
ON CONFLICT DO NOTHING;

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
        'content.manage',
        'vehicles.manage'
    )
WHERE roles.code = 'ASSOCIATION_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (
    role_id,
    permission_id
)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions
    ON permissions.code = 'vehicles.manage'
WHERE roles.code = 'RENTER'
ON CONFLICT DO NOTHING;

INSERT INTO users (
    role_id,
    email,
    password_hash,
    first_name,
    last_name,
    is_active,
    is_email_verified,
    password_changed_at
)
SELECT
    roles.id,
    LOWER(:'super_admin_email'),
    crypt(
        :'super_admin_password',
        gen_salt('bf', 12)
    ),
    :'super_admin_first_name',
    :'super_admin_last_name',
    TRUE,
    TRUE,
    NOW()
FROM roles
WHERE roles.code = 'SUPER_ADMIN'
ON CONFLICT (email) DO UPDATE
SET
    role_id = EXCLUDED.role_id,
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    is_active = TRUE,
    is_email_verified = TRUE,
    deleted_at = NULL,
    password_changed_at = NOW(),
    updated_at = NOW();

COMMIT;