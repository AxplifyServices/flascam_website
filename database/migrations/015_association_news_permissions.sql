BEGIN;

INSERT INTO permissions (
    code,
    name,
    description
)
VALUES
    (
        'association.content.manage',
        'Gérer les contenus de son association',
        'Permet à une association de créer, modifier, soumettre et dépublier ses propres publications.'
    ),
    (
        'association.media.manage',
        'Gérer les médias de son association',
        'Permet à une association de téléverser les médias utilisés dans ses contenus.'
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
    r.id,
    p.id
FROM roles r
JOIN permissions p
    ON p.code IN (
        'association.content.manage',
        'association.media.manage'
    )
WHERE r.code = 'ASSOCIATION_ADMIN'
ON CONFLICT DO NOTHING;

COMMIT;