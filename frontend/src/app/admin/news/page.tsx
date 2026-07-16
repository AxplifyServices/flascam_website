'use client';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

import {
  createNews,
  deleteNews,
  getAdminNews,
  getAdminNewsById,
  updateNews,
  updateNewsStatus,
  uploadNewsMedia,
} from '@/lib/news-api';

import type {
  NewsArticle,
  NewsContentType,
  NewsEventCategory,
  NewsFormMedia,
  NewsFormState,
  NewsStatus,
} from '@/types/news';

const contentTypeLabels:
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

const statusLabels:
  Record<
    NewsStatus,
    string
  > = {
    DRAFT:
      'Brouillon',

    PUBLISHED:
      'Publié',

    ARCHIVED:
      'Archivé',
  };

const eventCategoryLabels:
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

const emptyForm:
  NewsFormState = {
    contentType:
      'ACTUALITY',

    eventCategory:
      '',

    title:
      '',

    slug:
      '',

    excerpt:
      '',

    body:
      '',

    eventStartAt:
      '',

    eventEndAt:
      '',

    eventLocation:
      '',

    seoTitle:
      '',

    seoDescription:
      '',

    media:
      [],
  };

function slugify(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    );
}

function dateTimeLocalValue(
  value?: string | null,
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

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset *
          60 *
          1000,
    );

  return localDate
    .toISOString()
    .slice(
      0,
      16,
    );
}

function formFromArticle(
  article: NewsArticle,
): NewsFormState {
  return {
    contentType:
      article.contentType,

    eventCategory:
      article.eventCategory ??
      '',

    title:
      article.title,

    slug:
      article.slug,

    excerpt:
      article.excerpt ??
      '',

    body:
      article.body ??
      '',

    eventStartAt:
      dateTimeLocalValue(
        article.eventStartAt,
      ),

    eventEndAt:
      dateTimeLocalValue(
        article.eventEndAt,
      ),

    eventLocation:
      article.eventLocation ??
      '',

    seoTitle:
      article.seoTitle ??
      '',

    seoDescription:
      article.seoDescription ??
      '',

    media:
      article.media.map(
        (item) => ({
          localId:
            item.id,

          mediaAssetId:
            item.mediaAssetId,

          mediaType:
            item.mediaType,

          url:
            item.url,

          originalFilename:
            item.altText ??
            item.caption ??
            'Média',

          altText:
            item.altText ??
            '',

          caption:
            item.caption ??
            '',
        }),
      ),
  };
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return 'Non publié';
  }

  return new Intl.DateTimeFormat(
    'fr-FR',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(
    new Date(value),
  );
}

function statusClass(
  status: NewsStatus,
) {
  if (
    status ===
    'PUBLISHED'
  ) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (
    status ===
    'ARCHIVED'
  ) {
    return 'bg-slate-100 text-slate-600';
  }

  return 'bg-amber-50 text-amber-700';
}

export default function AdminNewsPage() {
  const [
    articles,
    setArticles,
  ] = useState<
    NewsArticle[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    submittedSearch,
    setSubmittedSearch,
  ] = useState('');

  const [
    typeFilter,
    setTypeFilter,
  ] = useState<
    NewsContentType | ''
  >('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    NewsStatus | ''
  >('');

  const [
    editorOpen,
    setEditorOpen,
  ] = useState(false);

  const [
    selectedArticle,
    setSelectedArticle,
  ] = useState<
    NewsArticle | null
  >(null);

  const [
    form,
    setForm,
  ] = useState<
    NewsFormState
  >(emptyForm);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    loadingDetails,
    setLoadingDetails,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    editorError,
    setEditorError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const isEvent =
    form.contentType ===
    'EVENT';

  const primaryMedia =
    form.media[0] ??
    null;

  const pageTitle =
    selectedArticle
      ? 'Modifier la publication'
      : 'Nouvelle publication';

  const canGoPrevious =
    page > 1;

  const canGoNext =
    page < totalPages;

  const mediaInputAccept =
    'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';

  const summaryText =
    useMemo(
      () =>
        `${total} publication${
          total > 1
            ? 's'
            : ''
        }`,
      [
        total,
      ],
    );

  useEffect(() => {
    void loadArticles();
  }, [
    page,
    submittedSearch,
    typeFilter,
    statusFilter,
  ]);

  async function loadArticles() {
    setLoading(true);
    setError('');

    try {
      const result =
        await getAdminNews({
          page,
          limit: 12,
          search:
            submittedSearch,
          contentType:
            typeFilter,
          status:
            statusFilter,
        });

      setArticles(
        result.items,
      );

      setTotal(
        result.pagination.total,
      );

      setTotalPages(
        Math.max(
          1,
          result.pagination.totalPages,
        ),
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de charger les actualités.',
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setSelectedArticle(
      null,
    );

    setForm({
      ...emptyForm,
      media: [],
    });

    setEditorError('');
    setEditorOpen(true);
  }

  async function openEdit(
    article: NewsArticle,
  ) {
    setEditorOpen(true);
    setLoadingDetails(true);
    setEditorError('');
    setSelectedArticle(
      article,
    );

    try {
      const details =
        await getAdminNewsById(
          article.id,
        );

      setSelectedArticle(
        details,
      );

      setForm(
        formFromArticle(
          details,
        ),
      );
    } catch (
      caughtError
    ) {
      setEditorError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de charger cette actualité.',
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeEditor() {
    if (
      saving ||
      uploading
    ) {
      return;
    }

    setEditorOpen(false);
    setSelectedArticle(
      null,
    );
    setEditorError('');
  }

function handleTitleChange(
  value: string,
) {
  setForm(
    (current) => ({
      ...current,

      title:
        value,

      slug:
        slugify(value).slice(
          0,
          180,
        ),
    }),
  );
}

  function handleTypeChange(
    value:
      NewsContentType,
  ) {
    setForm(
      (current) => ({
        ...current,

        contentType:
          value,

        eventCategory:
          value ===
          'EVENT'
            ? current.eventCategory
            : '',

        eventStartAt:
          value ===
          'EVENT'
            ? current.eventStartAt
            : '',

        eventEndAt:
          value ===
          'EVENT'
            ? current.eventEndAt
            : '',

        eventLocation:
          value ===
          'EVENT'
            ? current.eventLocation
            : '',
      }),
    );
  }

  async function handleUpload(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ??
        [],
      );

    event.target.value =
      '';

    if (!files.length) {
      return;
    }

    if (
      form.media.length +
        files.length >
      20
    ) {
      setEditorError(
        'Une publication ne peut pas contenir plus de 20 médias.',
      );
      return;
    }

    setUploading(true);
    setEditorError('');

    try {
      const uploaded:
        NewsFormMedia[] = [];

      for (
        const file of files
      ) {
        const result =
          await uploadNewsMedia(
            file,
          );

        uploaded.push({
          localId:
            crypto.randomUUID(),

          mediaAssetId:
            result.id,

          mediaType:
            result.mediaType,

          url:
            result.url,

          originalFilename:
            result.originalFilename,

          altText:
            result.mediaType ===
            'IMAGE'
              ? result.originalFilename
              : '',

          caption:
            '',
        });
      }

      setForm(
        (current) => ({
          ...current,

          media: [
            ...current.media,
            ...uploaded,
          ],
        }),
      );
    } catch (
      caughtError
    ) {
      setEditorError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible d’importer les médias.',
      );
    } finally {
      setUploading(false);
    }
  }

  function removeMedia(
    localId: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        media:
          current.media.filter(
            (item) =>
              item.localId !==
              localId,
          ),
      }),
    );
  }

  function updateMediaText(
    localId: string,
    field:
      | 'altText'
      | 'caption',
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,

        media:
          current.media.map(
            (item) =>
              item.localId ===
              localId
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item,
          ),
      }),
    );
  }

  function moveMedia(
    index: number,
    direction:
      | 'up'
      | 'down',
  ) {
    const targetIndex =
      direction ===
      'up'
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        form.media.length
    ) {
      return;
    }

    setForm(
      (current) => {
        const next =
          [
            ...current.media,
          ];

        [
          next[index],
          next[targetIndex],
        ] = [
          next[targetIndex],
          next[index],
        ];

        return {
          ...current,
          media:
            next,
        };
      },
    );
  }

  function validateForm() {
    if (
      !form.title.trim()
    ) {
      return 'Le titre est obligatoire.';
    }

const generatedSlug =
  slugify(
    form.title,
  ).slice(
    0,
    180,
  );

if (!generatedSlug) {
  return 'Le titre doit contenir au moins une lettre ou un chiffre.';
}

    if (
      isEvent &&
      !form.eventStartAt
    ) {
      return 'La date de début est obligatoire pour un événement.';
    }

    if (
      form.eventStartAt &&
      form.eventEndAt &&
      new Date(
        form.eventEndAt,
      ) <
        new Date(
          form.eventStartAt,
        )
    ) {
      return 'La date de fin doit être postérieure à la date de début.';
    }

    return '';
  }

async function saveArticle(
  event:
    React.FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const generatedSlug =
    slugify(
      form.title,
    ).slice(
      0,
      180,
    );

  const formToSave:
    NewsFormState = {
      ...form,
      slug:
        generatedSlug,
  };

  const validationError =
    validateForm();

    if (
      validationError
    ) {
      setEditorError(
        validationError,
      );
      return;
    }

    setSaving(true);
    setEditorError('');
    setSuccess('');

    try {
      if (
        selectedArticle
      ) {
await updateNews(
  selectedArticle.id,
  formToSave,
);
        setSuccess(
          'La publication a été mise à jour.',
        );
      } else {
await createNews(
  formToSave,
);

        setSuccess(
          'Le brouillon a été créé.',
        );
      }

      setEditorOpen(false);
      setSelectedArticle(
        null,
      );

      await loadArticles();
    } catch (
      caughtError
    ) {
      setEditorError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible d’enregistrer cette publication.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    article:
      NewsArticle,
    status:
      NewsStatus,
  ) {
    setActionId(
      article.id,
    );
    setError('');
    setSuccess('');

    try {
      await updateNewsStatus(
        article.id,
        status,
      );

      setSuccess(
        status ===
        'PUBLISHED'
          ? 'La publication est maintenant visible sur le site.'
          : status ===
              'DRAFT'
            ? 'La publication a été retirée du site et replacée en brouillon.'
            : 'La publication a été archivée.',
      );

      await loadArticles();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de modifier le statut.',
      );
    } finally {
      setActionId('');
    }
  }

  async function removeArticle(
    article:
      NewsArticle,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer définitivement la publication « ${article.title} » de l’administration ?`,
      );

    if (!confirmed) {
      return;
    }

    setActionId(
      article.id,
    );
    setError('');
    setSuccess('');

    try {
      await deleteNews(
        article.id,
      );

      setSuccess(
        'La publication a été supprimée.',
      );

      if (
        articles.length ===
          1 &&
        page > 1
      ) {
        setPage(
          page - 1,
        );
      } else {
        await loadArticles();
      }
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de supprimer cette publication.',
      );
    } finally {
      setActionId('');
    }
  }

  function submitSearch(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(
      search.trim(),
    );
  }

  return (
    <section
      className="
        mx-auto
        max-w-7xl
      "
    >
      <header
        className="
          blue-gradient-bg
          rounded-[2rem]
          border
          border-[var(--flascam-border)]
          p-5
          shadow-[0_24px_70px_rgba(7,53,93,0.08)]
          sm:p-7
          lg:flex
          lg:items-end
          lg:justify-between
          lg:gap-8
          lg:p-8
        "
      >
        <div>
          <p
            className="
              flex
              items-center
              gap-2
              text-xs
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-[var(--flascam-blue)]
            "
          >
            <Newspaper
              size={16}
            />

            Contenus
          </p>

          <h1
            className="
              mt-3
              text-3xl
              font-extrabold
              tracking-[-0.04em]
              text-[var(--flascam-black)]
              sm:text-4xl
            "
          >
            Actualités FLASCAM
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-[var(--flascam-slate)]
              sm:text-base
            "
          >
            Gérez les actualités,
            événements, communiqués
            officiels, publications
            réglementaires et revues
            de presse.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreate
          }
          className="
            mt-5
            inline-flex
            min-h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[var(--flascam-blue)]
            px-5
            py-3
            text-sm
            font-extrabold
            text-white
            transition
            hover:brightness-110
            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-blue-200
            lg:mt-0
            lg:w-auto
          "
        >
          <Plus
            size={18}
          />

          Nouvelle publication
        </button>
      </header>

      {success && (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            font-semibold
            text-emerald-800
          "
        >
          <Check
            className="
              mt-0.5
              shrink-0
            "
            size={18}
          />

          {success}
        </div>
      )}

      {error && (
        <div
          className="
            mt-5
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            font-semibold
            text-red-800
          "
        >
          {error}
        </div>
      )}

      <div
        className="
          mt-6
          rounded-3xl
          border
          border-[var(--flascam-border)]
          bg-white
          p-4
          shadow-sm
          sm:p-5
        "
      >
        <form
          onSubmit={
            submitSearch
          }
          className="
            grid
            gap-3
            lg:grid-cols-[minmax(0,1fr)_220px_180px_auto]
          "
        >
          <label
            className="
              relative
              block
            "
          >
            <span
              className="sr-only"
            >
              Rechercher
            </span>

            <Search
              size={18}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher par titre ou résumé"
              className="
                min-h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white
                pl-11
                pr-4
                text-sm
                text-slate-950
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[var(--flascam-blue)]
                focus:ring-4
                focus:ring-blue-100
              "
            />
          </label>

          <select
            value={
              typeFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);

              setTypeFilter(
                event.target.value as
                  | NewsContentType
                  | '',
              );
            }}
            className="
              min-h-12
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              text-slate-950
              outline-none
              focus:border-[var(--flascam-blue)]
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <option value="">
              Tous les types
            </option>

            {Object.entries(
              contentTypeLabels,
            ).map(
              (
                [
                  value,
                  label,
                ],
              ) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={
              statusFilter
            }
            onChange={(
              event,
            ) => {
              setPage(1);

              setStatusFilter(
                event.target.value as
                  | NewsStatus
                  | '',
              );
            }}
            className="
              min-h-12
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              text-slate-950
              outline-none
              focus:border-[var(--flascam-blue)]
              focus:ring-4
              focus:ring-blue-100
            "
          >
            <option value="">
              Tous les statuts
            </option>

            <option value="DRAFT">
              Brouillon
            </option>

            <option value="PUBLISHED">
              Publié
            </option>

            <option value="ARCHIVED">
              Archivé
            </option>
          </select>

          <button
            type="submit"
            className="
              min-h-12
              rounded-2xl
              border
              border-[var(--flascam-blue)]
              px-5
              text-sm
              font-extrabold
              text-[var(--flascam-blue)]
              transition
              hover:bg-blue-50
            "
          >
            Rechercher
          </button>
        </form>

        <div
          className="
            mt-4
            flex
            flex-col
            gap-2
            border-t
            border-slate-100
            pt-4
            text-sm
            text-[var(--flascam-slate)]
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            {summaryText}
          </span>

          <span>
            Page {page} sur{' '}
            {totalPages}
          </span>
        </div>
      </div>

      {loading ? (
        <div
          className="
            mt-6
            grid
            min-h-72
            place-items-center
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
          "
        >
          <Loader2
            size={32}
            className="animate-spin text-[var(--flascam-blue)]"
          />
        </div>
      ) : articles.length ===
        0 ? (
        <div
          className="
            mt-6
            rounded-3xl
            border
            border-dashed
            border-slate-300
            bg-white
            px-5
            py-16
            text-center
          "
        >
          <Newspaper
            size={36}
            className="
              mx-auto
              text-slate-300
            "
          />

          <h2
            className="
              mt-4
              text-xl
              font-extrabold
              text-slate-950
            "
          >
            Aucune publication
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-[var(--flascam-slate)]
            "
          >
            Créez la première
            actualité FLASCAM ou
            modifiez les filtres
            utilisés.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {articles.map(
            (article) => {
              const busy =
                actionId ===
                article.id;

              return (
                <article
                  key={
                    article.id
                  }
                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[var(--flascam-border)]
                    bg-white
                    shadow-sm
                  "
                >
                  <div
                    className="
                      relative
                      aspect-[16/9]
                      overflow-hidden
                      bg-slate-100
                    "
                  >
                    {article.primaryMedia?.mediaType ===
                    'IMAGE' ? (
                      <img
                        src={
                          article.primaryMedia.url
                        }
                        alt={
                          article.primaryMedia.altText ??
                          article.title
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : article.primaryMedia?.mediaType ===
                      'VIDEO' ? (
                      <video
                        src={
                          article.primaryMedia.url
                        }
                        muted
                        preload="metadata"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          grid
                          h-full
                          place-items-center
                          text-slate-300
                        "
                      >
                        <ImageIcon
                          size={42}
                        />
                      </div>
                    )}

                    <div
                      className="
                        absolute
                        left-3
                        top-3
                        flex
                        flex-wrap
                        gap-2
                      "
                    >
                      <span
                        className={`
                          rounded-full
                          px-3
                          py-1
                          text-[0.68rem]
                          font-extrabold
                          uppercase
                          tracking-wide
                          ${statusClass(
                            article.status,
                          )}
                        `}
                      >
                        {
                          statusLabels[
                            article.status
                          ]
                        }
                      </span>

                      {article.primaryMedia?.mediaType ===
                        'VIDEO' && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-full
                            bg-black/70
                            px-3
                            py-1
                            text-[0.68rem]
                            font-extrabold
                            uppercase
                            tracking-wide
                            text-white
                          "
                        >
                          <Video
                            size={12}
                          />

                          Vidéo
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="
                      p-5
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-extrabold
                        uppercase
                        tracking-[0.12em]
                        text-[var(--flascam-blue)]
                      "
                    >
                      {
                        contentTypeLabels[
                          article.contentType
                        ]
                      }
                    </p>

                    <h2
                      className="
                        mt-2
                        line-clamp-2
                        text-xl
                        font-extrabold
                        leading-tight
                        text-slate-950
                      "
                    >
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p
                        className="
                          mt-3
                          line-clamp-3
                          text-sm
                          leading-6
                          text-[var(--flascam-slate)]
                        "
                      >
                        {
                          article.excerpt
                        }
                      </p>
                    )}

                    <div
                      className="
                        mt-4
                        space-y-2
                        border-t
                        border-slate-100
                        pt-4
                        text-xs
                        text-slate-500
                      "
                    >
                      <p
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <Clock3
                          size={15}
                        />

                        {formatDate(
                          article.publishedAt,
                        )}
                      </p>

                      {article.contentType ===
                        'EVENT' &&
                        article.eventStartAt && (
                          <p
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >
                            <CalendarDays
                              size={15}
                            />

                            Événement :{' '}
                            {formatDate(
                              article.eventStartAt,
                            )}
                          </p>
                        )}

                      {article.eventLocation && (
                        <p
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <MapPin
                            size={15}
                          />

                          {
                            article.eventLocation
                          }
                        </p>
                      )}

                      <p>
                        {
                          article.media.length
                        } média
                        {article.media.length >
                        1
                          ? 's'
                          : ''}
                      </p>
                    </div>

                    <div
                      className="
                        mt-5
                        grid
                        grid-cols-2
                        gap-2
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void openEdit(
                            article,
                          )
                        }
                        disabled={
                          busy
                        }
                        className="
                          inline-flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          text-sm
                          font-bold
                          text-slate-700
                          transition
                          hover:border-[var(--flascam-blue)]
                          hover:text-[var(--flascam-blue)]
                          disabled:opacity-50
                        "
                      >
                        <Pencil
                          size={16}
                        />

                        Modifier
                      </button>

                      {article.status ===
                      'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() =>
                            void changeStatus(
                              article,
                              'DRAFT',
                            )
                          }
                          disabled={
                            busy
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-amber-200
                            bg-amber-50
                            px-3
                            text-sm
                            font-bold
                            text-amber-800
                            transition
                            hover:bg-amber-100
                            disabled:opacity-50
                          "
                        >
                          <Eye
                            size={16}
                          />

                          Dépublier
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            void changeStatus(
                              article,
                              'PUBLISHED',
                            )
                          }
                          disabled={
                            busy
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-emerald-600
                            px-3
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-emerald-700
                            disabled:opacity-50
                          "
                        >
                          {busy ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Check
                              size={16}
                            />
                          )}

                          Publier
                        </button>
                      )}

                      {article.status !==
                        'ARCHIVED' && (
                        <button
                          type="button"
                          onClick={() =>
                            void changeStatus(
                              article,
                              'ARCHIVED',
                            )
                          }
                          disabled={
                            busy
                          }
                          className="
                            inline-flex
                            min-h-11
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            px-3
                            text-sm
                            font-bold
                            text-slate-700
                            transition
                            hover:bg-slate-50
                            disabled:opacity-50
                          "
                        >
                          <Archive
                            size={16}
                          />

                          Archiver
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void removeArticle(
                            article,
                          )
                        }
                        disabled={
                          busy
                        }
                        className="
                          inline-flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          px-3
                          text-sm
                          font-bold
                          text-red-700
                          transition
                          hover:bg-red-50
                          disabled:opacity-50
                        "
                      >
                        <Trash2
                          size={16}
                        />

                        Supprimer
                      </button>
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      )}

      <div
        className="
          mt-6
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <button
          type="button"
          disabled={
            !canGoPrevious ||
            loading
          }
          onClick={() =>
            setPage(
              (current) =>
                current - 1,
            )
          }
          className="
            inline-flex
            min-h-11
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-bold
            text-slate-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <ArrowLeft
            size={17}
          />

          Précédente
        </button>

        <span
          className="
            text-sm
            font-semibold
            text-slate-600
          "
        >
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={
            !canGoNext ||
            loading
          }
          onClick={() =>
            setPage(
              (current) =>
                current + 1,
            )
          }
          className="
            inline-flex
            min-h-11
            items-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-bold
            text-slate-700
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Suivante

          <ArrowRight
            size={17}
          />
        </button>
      </div>

      {editorOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-end
            bg-slate-950/55
            backdrop-blur-sm
            sm:items-center
            sm:justify-center
            sm:p-5
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-editor-title"
        >
          <div
            className="
              flex
              max-h-[96vh]
              w-full
              flex-col
              overflow-hidden
              rounded-t-[2rem]
              bg-white
              shadow-2xl
              sm:max-h-[92vh]
              sm:max-w-5xl
              sm:rounded-[2rem]
            "
          >
            <header
              className="
                flex
                items-start
                justify-between
                gap-4
                border-b
                border-slate-200
                px-5
                py-4
                sm:px-7
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-extrabold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--flascam-blue)]
                  "
                >
                  Actualités
                </p>

                <h2
                  id="news-editor-title"
                  className="
                    mt-1
                    text-2xl
                    font-extrabold
                    text-slate-950
                  "
                >
                  {pageTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditor
                }
                disabled={
                  saving ||
                  uploading
                }
                className="
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-full
                  border
                  border-slate-200
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:opacity-50
                "
                aria-label="Fermer"
              >
                <X
                  size={20}
                />
              </button>
            </header>

            {loadingDetails ? (
              <div
                className="
                  grid
                  min-h-96
                  place-items-center
                "
              >
                <Loader2
                  size={32}
                  className="animate-spin text-[var(--flascam-blue)]"
                />
              </div>
            ) : (
              <form
                onSubmit={
                  saveArticle
                }
                className="
                  flex
                  min-h-0
                  flex-1
                  flex-col
                "
              >
                <div
                  className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    px-5
                    py-5
                    sm:px-7
                    sm:py-6
                  "
                >
                  {editorError && (
                    <div
                      className="
                        mb-5
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-4
                        text-sm
                        font-semibold
                        text-red-800
                      "
                    >
                      {
                        editorError
                      }
                    </div>
                  )}

                  <div
                    className="
                      grid
                      gap-5
                      lg:grid-cols-2
                    "
                  >
                    <Field
                      label="Type de publication"
                      required
                    >
                      <select
                        value={
                          form.contentType
                        }
                        onChange={(
                          event,
                        ) =>
                          handleTypeChange(
                            event.target.value as
                              NewsContentType,
                          )
                        }
                        className={inputClass}
                      >
                        {Object.entries(
                          contentTypeLabels,
                        ).map(
                          (
                            [
                              value,
                              label,
                            ],
                          ) => (
                            <option
                              key={
                                value
                              }
                              value={
                                value
                              }
                            >
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </Field>

                    {isEvent && (
                      <Field
                        label="Typologie de l’événement"
                      >
                        <select
                          value={
                            form.eventCategory
                          }
                          onChange={(
                            event,
                          ) =>
                            setForm(
                              (
                                current,
                              ) => ({
                                ...current,

                                eventCategory:
                                  event.target.value as
                                    | NewsEventCategory
                                    | '',
                              }),
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">
                            Sélectionner
                          </option>

                          {Object.entries(
                            eventCategoryLabels,
                          ).map(
                            (
                              [
                                value,
                                label,
                              ],
                            ) => (
                              <option
                                key={
                                  value
                                }
                                value={
                                  value
                                }
                              >
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </Field>
                    )}

                    <Field
                      label="Titre"
                      required
                      className="lg:col-span-2"
                    >
                      <input
                        type="text"
                        value={
                          form.title
                        }
                        onChange={(
                          event,
                        ) =>
                          handleTitleChange(
                            event.target.value,
                          )
                        }
                        maxLength={
                          255
                        }
                        className={inputClass}
                      />
                    </Field>



                    <Field
                      label="Résumé"
                      description="Utilisé dans les cartes, les résultats de recherche et la page d’accueil."
                      className="lg:col-span-2"
                    >
                      <textarea
                        value={
                          form.excerpt
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              excerpt:
                                event.target.value,
                            }),
                          )
                        }
                        rows={4}
                        className={textareaClass}
                      />
                    </Field>

                    <Field
                      label="Contenu complet"
                      className="lg:col-span-2"
                    >
                      <textarea
                        value={
                          form.body
                        }
                        onChange={(
                          event,
                        ) =>
                          setForm(
                            (
                              current,
                            ) => ({
                              ...current,

                              body:
                                event.target.value,
                            }),
                          )
                        }
                        rows={12}
                        className={textareaClass}
                      />
                    </Field>
                  </div>

                  {isEvent && (
                    <section
                      className="
                        mt-8
                        rounded-3xl
                        border
                        border-blue-100
                        bg-blue-50/60
                        p-5
                      "
                    >
                      <h3
                        className="
                          flex
                          items-center
                          gap-2
                          text-lg
                          font-extrabold
                          text-slate-950
                        "
                      >
                        <CalendarDays
                          size={20}
                          className="text-[var(--flascam-blue)]"
                        />

                        Informations de l’événement
                      </h3>

                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-[var(--flascam-slate)]
                        "
                      >
                        Ces dates permettront
                        d’afficher automatiquement
                        les événements à venir et
                        d’intégrer un calendrier
                        ultérieurement.
                      </p>

                      <div
                        className="
                          mt-5
                          grid
                          gap-5
                          md:grid-cols-2
                        "
                      >
                        <Field
                          label="Date et heure de début"
                          required
                        >
                          <input
                            type="datetime-local"
                            value={
                              form.eventStartAt
                            }
                            onChange={(
                              event,
                            ) =>
                              setForm(
                                (
                                  current,
                                ) => ({
                                  ...current,

                                  eventStartAt:
                                    event.target.value,
                                }),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label="Date et heure de fin"
                        >
                          <input
                            type="datetime-local"
                            value={
                              form.eventEndAt
                            }
                            onChange={(
                              event,
                            ) =>
                              setForm(
                                (
                                  current,
                                ) => ({
                                  ...current,

                                  eventEndAt:
                                    event.target.value,
                                }),
                              )
                            }
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label="Lieu"
                          className="md:col-span-2"
                        >
                          <input
                            type="text"
                            value={
                              form.eventLocation
                            }
                            onChange={(
                              event,
                            ) =>
                              setForm(
                                (
                                  current,
                                ) => ({
                                  ...current,

                                  eventLocation:
                                    event.target.value,
                                }),
                              )
                            }
                            maxLength={
                              255
                            }
                            placeholder="Exemple : Casablanca"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </section>
                  )}

                  <section
                    className="
                      mt-8
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                      "
                    >
                      <div>
                        <h3
                          className="
                            text-lg
                            font-extrabold
                            text-slate-950
                          "
                        >
                          Photos et vidéos
                        </h3>

                        <p
                          className="
                            mt-1
                            text-sm
                            leading-6
                            text-[var(--flascam-slate)]
                          "
                        >
                          Le premier média
                          sera utilisé comme
                          couverture sur la
                          page d’actualités et
                          sur la page d’accueil.
                        </p>
                      </div>

                      <label
                        className={`
                          inline-flex
                          min-h-12
                          cursor-pointer
                          items-center
                          justify-center
                          gap-2
                          rounded-2xl
                          border
                          border-[var(--flascam-blue)]
                          px-5
                          text-sm
                          font-extrabold
                          text-[var(--flascam-blue)]
                          transition
                          hover:bg-blue-50
                          ${
                            uploading
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        `}
                      >
                        {uploading ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Upload
                            size={18}
                          />
                        )}

                        {uploading
                          ? 'Import en cours…'
                          : 'Ajouter des médias'}

                        <input
                          type="file"
                          multiple
                          accept={
                            mediaInputAccept
                          }
                          onChange={
                            handleUpload
                          }
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {primaryMedia && (
                      <div
                        className="
                          mt-5
                          flex
                          items-start
                          gap-3
                          rounded-2xl
                          border
                          border-emerald-200
                          bg-emerald-50
                          p-4
                          text-sm
                          text-emerald-800
                        "
                      >
                        <Check
                          size={18}
                          className="
                            mt-0.5
                            shrink-0
                          "
                        />

                        <span>
                          <strong>
                            Couverture actuelle :
                          </strong>{' '}
                          {
                            primaryMedia.originalFilename
                          }
                        </span>
                      </div>
                    )}

                    {form.media.length ===
                    0 ? (
                      <div
                        className="
                          mt-5
                          rounded-3xl
                          border
                          border-dashed
                          border-slate-300
                          px-5
                          py-10
                          text-center
                          text-sm
                          text-[var(--flascam-slate)]
                        "
                      >
                        Aucune photo ou
                        vidéo ajoutée.
                      </div>
                    ) : (
                      <div
                        className="
                          mt-5
                          space-y-4
                        "
                      >
                        {form.media.map(
                          (
                            media,
                            index,
                          ) => (
                            <div
                              key={
                                media.localId
                              }
                              className="
                                grid
                                gap-4
                                rounded-3xl
                                border
                                border-slate-200
                                p-4
                                md:grid-cols-[180px_minmax(0,1fr)]
                              "
                            >
                              <div>
                                <div
                                  className="
                                    relative
                                    aspect-video
                                    overflow-hidden
                                    rounded-2xl
                                    bg-slate-100
                                  "
                                >
                                  {media.mediaType ===
                                  'IMAGE' ? (
                                    <img
                                      src={
                                        media.url
                                      }
                                      alt={
                                        media.altText ||
                                        media.originalFilename
                                      }
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />
                                  ) : (
                                    <video
                                      src={
                                        media.url
                                      }
                                      controls
                                      preload="metadata"
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />
                                  )}

                                  {index ===
                                    0 && (
                                    <span
                                      className="
                                        absolute
                                        left-2
                                        top-2
                                        rounded-full
                                        bg-emerald-600
                                        px-3
                                        py-1
                                        text-[0.65rem]
                                        font-extrabold
                                        uppercase
                                        tracking-wide
                                        text-white
                                      "
                                    >
                                      Couverture
                                    </span>
                                  )}
                                </div>

                                <div
                                  className="
                                    mt-3
                                    grid
                                    grid-cols-3
                                    gap-2
                                  "
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveMedia(
                                        index,
                                        'up',
                                      )
                                    }
                                    disabled={
                                      index ===
                                      0
                                    }
                                    className="
                                      grid
                                      min-h-10
                                      place-items-center
                                      rounded-xl
                                      border
                                      border-slate-200
                                      text-slate-600
                                      disabled:opacity-30
                                    "
                                    aria-label="Monter le média"
                                  >
                                    <ArrowUp
                                      size={17}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      moveMedia(
                                        index,
                                        'down',
                                      )
                                    }
                                    disabled={
                                      index ===
                                      form.media.length -
                                        1
                                    }
                                    className="
                                      grid
                                      min-h-10
                                      place-items-center
                                      rounded-xl
                                      border
                                      border-slate-200
                                      text-slate-600
                                      disabled:opacity-30
                                    "
                                    aria-label="Descendre le média"
                                  >
                                    <ArrowDown
                                      size={17}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeMedia(
                                        media.localId,
                                      )
                                    }
                                    className="
                                      grid
                                      min-h-10
                                      place-items-center
                                      rounded-xl
                                      border
                                      border-red-200
                                      text-red-700
                                      transition
                                      hover:bg-red-50
                                    "
                                    aria-label="Supprimer le média"
                                  >
                                    <Trash2
                                      size={17}
                                    />
                                  </button>
                                </div>
                              </div>

                              <div
                                className="
                                  grid
                                  content-start
                                  gap-4
                                "
                              >
                                <div>
                                  <p
                                    className="
                                      flex
                                      items-center
                                      gap-2
                                      text-xs
                                      font-extrabold
                                      uppercase
                                      tracking-wide
                                      text-[var(--flascam-blue)]
                                    "
                                  >
                                    {media.mediaType ===
                                    'IMAGE' ? (
                                      <ImageIcon
                                        size={15}
                                      />
                                    ) : (
                                      <Video
                                        size={15}
                                      />
                                    )}

                                    Média{' '}
                                    {index +
                                      1}
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      break-all
                                      text-sm
                                      text-slate-600
                                    "
                                  >
                                    {
                                      media.originalFilename
                                    }
                                  </p>
                                </div>

                                <Field
                                  label="Texte alternatif"
                                  description="Important pour l’accessibilité et le référencement des images."
                                >
                                  <input
                                    type="text"
                                    value={
                                      media.altText
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateMediaText(
                                        media.localId,
                                        'altText',
                                        event.target.value,
                                      )
                                    }
                                    maxLength={
                                      255
                                    }
                                    className={inputClass}
                                  />
                                </Field>

                                <Field
                                  label="Légende"
                                >
                                  <textarea
                                    value={
                                      media.caption
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateMediaText(
                                        media.localId,
                                        'caption',
                                        event.target.value,
                                      )
                                    }
                                    rows={3}
                                    className={textareaClass}
                                  />
                                </Field>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>

                  <section
                    className="
                      mt-8
                      rounded-3xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-5
                    "
                  >
                    <h3
                      className="
                        flex
                        items-center
                        gap-2
                        text-lg
                        font-extrabold
                        text-slate-950
                      "
                    >
                      <FileText
                        size={20}
                        className="text-[var(--flascam-blue)]"
                      />

                      Référencement SEO
                    </h3>

                    <div
                      className="
                        mt-5
                        grid
                        gap-5
                      "
                    >
                      <Field
                        label="Titre SEO"
                        description={`${form.seoTitle.length}/255 caractères`}
                      >
                        <input
                          type="text"
                          value={
                            form.seoTitle
                          }
                          onChange={(
                            event,
                          ) =>
                            setForm(
                              (
                                current,
                              ) => ({
                                ...current,

                                seoTitle:
                                  event.target.value,
                              }),
                            )
                          }
                          maxLength={
                            255
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field
                        label="Description SEO"
                        description={`${form.seoDescription.length}/320 caractères`}
                      >
                        <textarea
                          value={
                            form.seoDescription
                          }
                          onChange={(
                            event,
                          ) =>
                            setForm(
                              (
                                current,
                              ) => ({
                                ...current,

                                seoDescription:
                                  event.target.value,
                              }),
                            )
                          }
                          maxLength={
                            320
                          }
                          rows={4}
                          className={textareaClass}
                        />
                      </Field>
                    </div>
                  </section>
                </div>

                <footer
                  className="
                    grid
                    gap-3
                    border-t
                    border-slate-200
                    bg-white
                    px-5
                    py-4
                    sm:grid-cols-[auto_1fr]
                    sm:px-7
                  "
                >
                  <button
                    type="button"
                    onClick={
                      closeEditor
                    }
                    disabled={
                      saving ||
                      uploading
                    }
                    className="
                      min-h-12
                      rounded-2xl
                      border
                      border-slate-200
                      px-5
                      text-sm
                      font-extrabold
                      text-slate-700
                      disabled:opacity-50
                    "
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploading
                    }
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-[var(--flascam-blue)]
                      px-5
                      text-sm
                      font-extrabold
                      text-white
                      transition
                      hover:brightness-110
                      disabled:opacity-50
                    "
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={18}
                      />
                    )}

                    {selectedArticle
                      ? 'Enregistrer les modifications'
                      : 'Créer le brouillon'}
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

const inputClass = `
  min-h-12
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  text-sm
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[var(--flascam-blue)]
  focus:ring-4
  focus:ring-blue-100
`;

const textareaClass = `
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-white
  px-4
  py-3
  text-sm
  leading-6
  text-slate-950
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[var(--flascam-blue)]
  focus:ring-4
  focus:ring-blue-100
`;

function Field({
  label,
  description,
  required,
  className,
  children,
}: {
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  children:
    React.ReactNode;
}) {
  return (
    <label
      className={`
        block
        ${className ?? ''}
      `}
    >
      <span
        className="
          text-sm
          font-extrabold
          text-slate-800
        "
      >
        {label}

        {required && (
          <span
            className="
              ml-1
              text-red-600
            "
          >
            *
          </span>
        )}
      </span>

      {description && (
        <span
          className="
            mt-1
            block
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </span>
      )}

      <span
        className="
          mt-2
          block
        "
      >
        {children}
      </span>
    </label>
  );
}