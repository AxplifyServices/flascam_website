import type {
  NewsContentType,
  NewsEventCategory,
  NewsEventPeriod,
} from '@/types/news';

export const newsContentTypeLabels:
  Record<
    NewsContentType,
    string
  > = {
    ACTUALITY:
      'Actualité',

    EVENT:
      'Événement',

    OFFICIAL_RELEASE:
      'Communiqué officiel',

    REGULATORY_PUBLICATION:
      'Publication réglementaire',

    PRESS_REVIEW:
      'Revue de presse',
  };

export const newsEventCategoryLabels:
  Record<
    NewsEventCategory,
    string
  > = {
    SALON_EXPOSITION:
      'Salon et exposition',

    CONFERENCE_SOMMET:
      'Conférence et sommet',

    ASSEMBLEE_INSTITUTIONNELLE:
      'Assemblée institutionnelle',

    PRESSE_MEDIA:
      'Presse et médias',

    PRIX_CONCOURS:
      'Prix et concours',

    PARTENARIAT:
      'Partenariat',

    RENCONTRE_INSTITUTIONNELLE:
      'Rencontre institutionnelle',

    LANCEMENT_AUTOMOBILE:
      'Lancement automobile',

    FORMATION_ATELIER:
      'Formation et atelier',

    OTHER:
      'Autre',
  };

export const newsEventPeriodLabels:
  Record<
    Exclude<
      NewsEventPeriod,
      null
    >,
    string
  > = {
    UPCOMING:
      'À venir',

    ONGOING:
      'En cours',

    PAST:
      'Terminé',
  };

export function formatNewsDate(
  value?: string | null,
  options?: {
    withTime?: boolean;
  },
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return new Intl.DateTimeFormat(
    'fr-MA',
    options?.withTime
      ? {
          dateStyle:
            'long',

          timeStyle:
            'short',
        }
      : {
          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        },
  ).format(date);
}

export function formatNewsDateRange(
  start?: string | null,
  end?: string | null,
) {
  const formattedStart =
    formatNewsDate(
      start,
      {
        withTime: true,
      },
    );

  if (!end) {
    return formattedStart;
  }

  const formattedEnd =
    formatNewsDate(
      end,
      {
        withTime: true,
      },
    );

  if (!formattedStart) {
    return formattedEnd;
  }

  return `${formattedStart} — ${formattedEnd}`;
}