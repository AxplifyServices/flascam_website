\set ON_ERROR_STOP on

BEGIN;

CREATE TABLE institutional_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    slug VARCHAR(100)
        NOT NULL
        UNIQUE
        DEFAULT 'home',

    hero_eyebrow VARCHAR(180),
    hero_title VARCHAR(255) NOT NULL,
    hero_subtitle TEXT,

    hero_primary_cta_label VARCHAR(120),
    hero_primary_cta_url VARCHAR(255),

    hero_secondary_cta_label VARCHAR(120),
    hero_secondary_cta_url VARCHAR(255),

    federation_eyebrow VARCHAR(180),
    federation_title VARCHAR(255),
    federation_body TEXT,

    missions_eyebrow VARCHAR(180),
    missions_title VARCHAR(255),
    missions_body TEXT,

    governance_eyebrow VARCHAR(180),
    governance_title VARCHAR(255),
    governance_body TEXT,

    executive_office_eyebrow VARCHAR(180),
    executive_office_title VARCHAR(255),
    executive_office_body TEXT,

    partners_eyebrow VARCHAR(180),
    partners_title VARCHAR(255),
    partners_body TEXT,

    documents_eyebrow VARCHAR(180),
    documents_title VARCHAR(255),
    documents_body TEXT,

    contact_eyebrow VARCHAR(180),
    contact_title VARCHAR(255),
    contact_body TEXT,

    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_address TEXT,

    seo_title VARCHAR(255),
    seo_description VARCHAR(320),

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE institutional_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE institutional_key_figures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    value VARCHAR(80) NOT NULL,
    label VARCHAR(180) NOT NULL,
    description TEXT,

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE executive_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(180) NOT NULL,
    position VARCHAR(180) NOT NULL,
    biography TEXT,

    image_url TEXT,
    linkedin_url TEXT,

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE institutional_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(180) NOT NULL,
    description TEXT,

    logo_url TEXT,
    website_url TEXT,

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE institutional_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(255) NOT NULL,
    description TEXT,

    document_type VARCHAR(80),
    file_url TEXT NOT NULL,
    file_size_label VARCHAR(50),

    publication_date DATE,

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    is_published BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()
);

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(180) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    status VARCHAR(30)
        NOT NULL
        DEFAULT 'NEW',

    processed_by_user_id UUID,
    processed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT contact_messages_status_check
        CHECK (
            status IN (
                'NEW',
                'IN_PROGRESS',
                'PROCESSED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT contact_messages_processed_by_user_id_fkey
        FOREIGN KEY (
            processed_by_user_id
        )
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX institutional_missions_order_idx
    ON institutional_missions(display_order);

CREATE INDEX institutional_key_figures_order_idx
    ON institutional_key_figures(display_order);

CREATE INDEX executive_members_order_idx
    ON executive_members(display_order);

CREATE INDEX institutional_partners_order_idx
    ON institutional_partners(display_order);

CREATE INDEX institutional_documents_order_idx
    ON institutional_documents(display_order);

CREATE INDEX contact_messages_status_idx
    ON contact_messages(status);

CREATE INDEX contact_messages_created_at_idx
    ON contact_messages(created_at DESC);

INSERT INTO institutional_contents (
    slug,

    hero_eyebrow,
    hero_title,
    hero_subtitle,

    hero_primary_cta_label,
    hero_primary_cta_url,

    hero_secondary_cta_label,
    hero_secondary_cta_url,

    federation_eyebrow,
    federation_title,
    federation_body,

    missions_eyebrow,
    missions_title,
    missions_body,

    governance_eyebrow,
    governance_title,
    governance_body,

    executive_office_eyebrow,
    executive_office_title,
    executive_office_body,

    partners_eyebrow,
    partners_title,
    partners_body,

    documents_eyebrow,
    documents_title,
    documents_body,

    contact_eyebrow,
    contact_title,
    contact_body,

    contact_email,
    contact_phone,
    contact_address,

    seo_title,
    seo_description,

    is_published
)
VALUES (
    'home',

    'Fédération nationale',
    'Structurer, représenter et faire progresser la location automobile au Maroc.',
    'La FLASCAM fédère les professionnels de la location automobile sans chauffeur et porte leurs intérêts auprès des institutions et partenaires du secteur.',

    'Découvrir la fédération',
    '#federation',

    'Nous contacter',
    '#contact',

    'La fédération',
    'Une organisation au service des professionnels de la mobilité',
    'La FLASCAM rassemble les acteurs de la location automobile sans chauffeur au Maroc. Elle agit pour structurer la profession, renforcer sa représentation et accompagner son développement durable.',

    'Nos missions',
    'Défendre la profession et accompagner sa transformation',
    'La fédération intervient sur les enjeux réglementaires, économiques, technologiques et organisationnels du secteur.',

    'Gouvernance',
    'Une gouvernance représentative et responsable',
    'La gouvernance de la FLASCAM repose sur une représentation équilibrée des professionnels et des associations régionales, avec une organisation transparente et orientée vers l’intérêt collectif.',

    'Bureau exécutif',
    'Des professionnels engagés au service de la fédération',
    'Le bureau exécutif assure le pilotage stratégique de la FLASCAM et représente ses adhérents auprès de ses différents interlocuteurs.',

    'Partenaires',
    'Un réseau institutionnel et professionnel',
    'La FLASCAM développe des partenariats utiles à la profession et à la modernisation du secteur.',

    'Ressources',
    'Documents institutionnels',
    'Consultez les principaux documents, publications et ressources officielles de la fédération.',

    'Contact',
    'Échangeons sur les enjeux de la profession',
    'Vous souhaitez contacter la fédération, proposer un partenariat ou obtenir une information ? Envoyez-nous votre demande.',

    'contact@flascam.ma',
    '+212 5 00 00 00 00',
    'Casablanca, Maroc',

    'FLASCAM — Fédération des loueurs automobiles sans chauffeur au Maroc',
    'Découvrez la FLASCAM, ses missions, sa gouvernance, ses partenaires et ses actions en faveur des professionnels de la location automobile au Maroc.',

    TRUE
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO institutional_missions (
    title,
    description,
    display_order
)
VALUES
    (
        'Représenter la profession',
        'Porter la voix des loueurs automobiles sans chauffeur auprès des pouvoirs publics, institutions et partenaires.',
        10
    ),
    (
        'Structurer le secteur',
        'Contribuer à la professionnalisation, à la transparence et à l’amélioration continue des pratiques.',
        20
    ),
    (
        'Accompagner les adhérents',
        'Informer, conseiller et soutenir les professionnels face aux évolutions réglementaires et économiques.',
        30
    ),
    (
        'Favoriser la coopération',
        'Créer des synergies entre la fédération, les associations régionales et les acteurs de la mobilité.',
        40
    )
ON CONFLICT DO NOTHING;

INSERT INTO institutional_key_figures (
    value,
    label,
    description,
    display_order
)
VALUES
    (
        '12',
        'Régions représentées',
        'Une présence territoriale au plus près des professionnels.',
        10
    ),
    (
        '+500',
        'Professionnels',
        'Un réseau fédérant les acteurs de la location automobile.',
        20
    ),
    (
        '1',
        'Voix nationale',
        'Une représentation commune pour défendre la profession.',
        30
    )
ON CONFLICT DO NOTHING;

COMMIT;