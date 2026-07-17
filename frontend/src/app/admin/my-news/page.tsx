'use client';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Clock3,
  EyeOff,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';

import {
  createAssociationNews,
  deleteAssociationNews,
  getAssociationNews,
  getAssociationNewsById,
  submitAssociationNews,
  unpublishAssociationNews,
  updateAssociationNews,
  uploadAssociationNewsMedia,
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

    PENDING_REVIEW:
      'En attente de validation',

    REJECTED:
      'Refusé',

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
    .normalize(
      'NFD',
    )
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
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset *
        60 *
        1000,
  )
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
        (
          media,
        ) => ({
          localId:
            media.id,

          mediaAssetId:
            media.mediaAssetId,

          mediaType:
            media.mediaType,

          url:
            media.url,

          originalFilename:
            media.caption ||
            media.altText ||
            'Média',

          altText:
            media.altText ??
            '',

          caption:
            media.caption ??
            '',
        }),
      ),
  };
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return 'Non renseignée';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Non renseignée';
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
    date,
  );
}

function statusClass(
  status: NewsStatus,
) {
  if (
    status ===
    'PUBLISHED'
  ) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (
    status ===
    'PENDING_REVIEW'
  ) {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  if (
    status ===
    'REJECTED'
  ) {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (
    status ===
    'ARCHIVED'
  ) {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-[#07355d]">
        {label}

        {required && (
          <span className="ml-1 text-[#c96f4a]">
            *
          </span>
        )}
      </span>

      {children}

      {hint && (
        <span className="mt-2 block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}

function LoadingBlock() {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white">
      <Loader2
        className="animate-spin text-[#0f5f9f]"
        size={
          28
        }
        aria-hidden="true"
      />
    </div>
  );
}

export default function AssociationNewsPage() {
  const [
    articles,
    setArticles,
  ] =
    useState<
      NewsArticle[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    loadingArticle,
    setLoadingArticle,
  ] =
    useState(
      false,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    uploading,
    setUploading,
  ] =
    useState(
      false,
    );

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      NewsStatus | ''
    >(
      '',
    );

  const [
    contentTypeFilter,
    setContentTypeFilter,
  ] =
    useState<
      NewsContentType | ''
    >(
      '',
    );

  const [
    page,
    setPage,
  ] =
    useState(
      1,
    );

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(
      1,
    );

  const [
    total,
    setTotal,
  ] =
    useState(
      0,
    );

  const [
    editorOpen,
    setEditorOpen,
  ] =
    useState(
      false,
    );

  const [
    selectedArticle,
    setSelectedArticle,
  ] =
    useState<
      NewsArticle | null
    >(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<
      NewsFormState
    >(
      emptyForm,
    );

  const editorLocked =
    selectedArticle?.status ===
    'PENDING_REVIEW';

  const canEdit =
    !selectedArticle ||
    selectedArticle.status ===
      'DRAFT' ||
    selectedArticle.status ===
      'REJECTED';

  const canDelete =
    selectedArticle?.status ===
      'DRAFT' ||
    selectedArticle?.status ===
      'REJECTED';

  const canSubmit =
    Boolean(
      selectedArticle &&
        (
          selectedArticle.status ===
            'DRAFT' ||
          selectedArticle.status ===
            'REJECTED'
        ),
    );

  const canUnpublish =
    selectedArticle?.status ===
    'PUBLISHED';

  const hasEventFields =
    form.contentType ===
    'EVENT';

  const loadArticles =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const result =
            await getAssociationNews({
              page,
              limit:
                12,

              search:
                search.trim() ||
                undefined,

              status:
                statusFilter,

              contentType:
                contentTypeFilter,
            });

          setArticles(
            result.items,
          );

          setTotal(
            result.pagination.total,
          );

          setTotalPages(
            Math.max(
              result.pagination.totalPages,
              1,
            ),
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Impossible de charger vos actualités.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        contentTypeFilter,
        page,
        search,
        statusFilter,
      ],
    );

  useEffect(
    () => {
      const timeout =
        window.setTimeout(
          () => {
            void loadArticles();
          },
          250,
        );

      return () => {
        window.clearTimeout(
          timeout,
        );
      };
    },
    [
      loadArticles,
    ],
  );

  useEffect(
    () => {
      setPage(
        1,
      );
    },
    [
      search,
      statusFilter,
      contentTypeFilter,
    ],
  );

  const openCreate =
    () => {
      setSelectedArticle(
        null,
      );

      setForm(
        emptyForm,
      );

      setError(
        null,
      );

      setSuccess(
        null,
      );

      setEditorOpen(
        true,
      );

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });
    };

  const openEdit =
    async (
      articleId: string,
    ) => {
      setLoadingArticle(
        true,
      );

      setError(
        null,
      );

      setSuccess(
        null,
      );

      try {
        const article =
          await getAssociationNewsById(
            articleId,
          );

        setSelectedArticle(
          article,
        );

        setForm(
          formFromArticle(
            article,
          ),
        );

        setEditorOpen(
          true,
        );

        window.scrollTo({
          top:
            0,

          behavior:
            'smooth',
        });
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Impossible d’ouvrir cette publication.',
        );
      } finally {
        setLoadingArticle(
          false,
        );
      }
    };

  const closeEditor =
    () => {
      if (
        saving ||
        uploading
      ) {
        return;
      }

      setEditorOpen(
        false,
      );

      setSelectedArticle(
        null,
      );

      setForm(
        emptyForm,
      );

      setError(
        null,
      );

      setSuccess(
        null,
      );
    };

  const updateField =
    <
      Key extends keyof NewsFormState,
    >(
      key: Key,
      value: NewsFormState[Key],
    ) => {
      setForm(
        (
          current,
        ) => ({
          ...current,
          [key]:
            value,
        }),
      );
    };

  const handleTitleChange =
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const title =
        event.target.value;

      setForm(
        (
          current,
        ) => ({
          ...current,
          title,
          slug:
            slugify(
              title,
            ),
        }),
      );
    };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (
        !canEdit
      ) {
        return;
      }

      setSaving(
        true,
      );

      setError(
        null,
      );

      setSuccess(
        null,
      );

      try {
        let saved:
          NewsArticle;

        if (
          selectedArticle
        ) {
          saved =
            await updateAssociationNews(
              selectedArticle.id,
              form,
            );
        } else {
          saved =
            await createAssociationNews(
              form,
            );
        }

        setSelectedArticle(
          saved,
        );

        setForm(
          formFromArticle(
            saved,
          ),
        );

        setSuccess(
          selectedArticle
            ? 'Les modifications ont été enregistrées.'
            : 'Le brouillon a été créé.',
        );

        await loadArticles();
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Impossible d’enregistrer la publication.',
        );
      } finally {
        setSaving(
          false,
        );
      }
    };

  const handleMediaUpload =
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const files =
        Array.from(
          event.target.files ??
            [],
        );

      event.target.value =
        '';

      if (
        files.length ===
        0
      ) {
        return;
      }

      setUploading(
        true,
      );

      setError(
        null,
      );

      try {
        const uploadedMedia:
          NewsFormMedia[] =
          [];

        for (
          const file of
          files
        ) {
          const uploaded =
            await uploadAssociationNewsMedia(
              file,
            );

          uploadedMedia.push({
            localId:
              `${uploaded.id}-${Date.now()}-${Math.random()}`,

            mediaAssetId:
              uploaded.id,

            mediaType:
              uploaded.mediaType,

            url:
              uploaded.url,

            originalFilename:
              uploaded.originalFilename,

            altText:
              '',

            caption:
              '',
          });
        }

        setForm(
          (
            current,
          ) => ({
            ...current,

            media: [
              ...current.media,
              ...uploadedMedia,
            ],
          }),
        );
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Impossible d’envoyer le média.',
        );
      } finally {
        setUploading(
          false,
        );
      }
    };

  const moveMedia =
    (
      index: number,
      direction:
        | -1
        | 1,
    ) => {
      setForm(
        (
          current,
        ) => {
          const targetIndex =
            index +
            direction;

          if (
            targetIndex <
              0 ||
            targetIndex >=
              current.media.length
          ) {
            return current;
          }

          const media = [
            ...current.media,
          ];

          const [
            moved,
          ] =
            media.splice(
              index,
              1,
            );

          media.splice(
            targetIndex,
            0,
            moved,
          );

          return {
            ...current,
            media,
          };
        },
      );
    };

  const removeMedia =
    (
      index: number,
    ) => {
      setForm(
        (
          current,
        ) => ({
          ...current,

          media:
            current.media.filter(
              (
                _,
                mediaIndex,
              ) =>
                mediaIndex !==
                index,
            ),
        }),
      );
    };

  const updateMedia =
    (
      index: number,
      key:
        | 'altText'
        | 'caption',
      value: string,
    ) => {
      setForm(
        (
          current,
        ) => ({
          ...current,

          media:
            current.media.map(
              (
                media,
                mediaIndex,
              ) =>
                mediaIndex ===
                index
                  ? {
                      ...media,
                      [key]:
                        value,
                    }
                  : media,
            ),
        }),
      );
    };

  const runArticleAction =
    async (
      action:
        | 'submit'
        | 'unpublish'
        | 'delete',
    ) => {
      if (
        !selectedArticle
      ) {
        return;
      }

      if (
        action ===
          'delete' &&
        !window.confirm(
          'Supprimer définitivement ce brouillon ?',
        )
      ) {
        return;
      }

      if (
        action ===
          'unpublish' &&
        !window.confirm(
          'Dépublier cette actualité ? Elle ne sera plus visible sur le site.',
        )
      ) {
        return;
      }

      if (
        action ===
          'submit' &&
        !window.confirm(
          'Soumettre cette publication à FLASCAM pour validation ? Vous ne pourrez plus la modifier pendant son examen.',
        )
      ) {
        return;
      }

      setActionLoading(
        action,
      );

      setError(
        null,
      );

      setSuccess(
        null,
      );

      try {
        if (
          action ===
          'submit'
        ) {
          const updated =
            await submitAssociationNews(
              selectedArticle.id,
            );

          setSelectedArticle(
            updated,
          );

          setForm(
            formFromArticle(
              updated,
            ),
          );

          setSuccess(
            'La publication a été soumise à FLASCAM.',
          );
        }

        if (
          action ===
          'unpublish'
        ) {
          const updated =
            await unpublishAssociationNews(
              selectedArticle.id,
            );

          setSelectedArticle(
            updated,
          );

          setForm(
            formFromArticle(
              updated,
            ),
          );

          setSuccess(
            'La publication a été dépubliée et replacée en brouillon.',
          );
        }

        if (
          action ===
          'delete'
        ) {
          await deleteAssociationNews(
            selectedArticle.id,
          );

          setEditorOpen(
            false,
          );

          setSelectedArticle(
            null,
          );

          setForm(
            emptyForm,
          );

          setSuccess(
            'Le brouillon a été supprimé.',
          );
        }

        await loadArticles();
      } catch (
        caught
      ) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Cette action n’a pas pu être effectuée.',
        );
      } finally {
        setActionLoading(
          null,
        );
      }
    };

  const resultLabel =
    useMemo(
      () => {
        if (
          total ===
          0
        ) {
          return 'Aucune publication';
        }

        if (
          total ===
          1
        ) {
          return '1 publication';
        }

        return `${total} publications`;
      },
      [
        total,
      ],
    );

  return (
    <main className="min-w-0">
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eaf5ff] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f5f9f]">
            <Newspaper
              size={
                15
              }
              aria-hidden="true"
            />

            Espace association
          </div>

          <h1 className="text-2xl font-black tracking-tight text-[#07355d] sm:text-3xl">
            Mes actualités et événements
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Créez vos contenus, puis
            soumettez-les à FLASCAM.
            Une publication validée
            apparaîtra automatiquement
            sur le site.
          </p>
        </div>

        {!editorOpen && (
          <button
            type="button"
            onClick={
              openCreate
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c96f4a] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#b75f3c] focus:outline-none focus:ring-4 focus:ring-[#c96f4a]/20"
          >
            <Plus
              size={
                18
              }
              aria-hidden="true"
            />

            Créer une publication
          </button>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          <AlertCircle
            className="mt-0.5 shrink-0"
            size={
              18
            }
            aria-hidden="true"
          />

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
        >
          <CheckCircle2
            className="mt-0.5 shrink-0"
            size={
              18
            }
            aria-hidden="true"
          />

          <span>
            {success}
          </span>
        </div>
      )}

      {editorOpen ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-[#f7fbff] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={
                  closeEditor
                }
                disabled={
                  saving ||
                  uploading
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[#07355d] transition hover:border-[#0f5f9f] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Retour à la liste"
              >
                <ArrowLeft
                  size={
                    18
                  }
                  aria-hidden="true"
                />
              </button>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-[#07355d] sm:text-xl">
                  {selectedArticle
                    ? selectedArticle.title
                    : 'Nouvelle publication'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedArticle
                    ? `Dernière modification : ${formatDate(
                        selectedArticle.updatedAt,
                      )}`
                    : 'Commencez par enregistrer un brouillon.'}
                </p>
              </div>
            </div>

            {selectedArticle && (
              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusClass(
                  selectedArticle.status,
                )}`}
              >
                {
                  statusLabels[
                    selectedArticle.status
                  ]
                }
              </span>
            )}
          </div>

          {editorLocked && (
            <div className="m-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800 sm:m-6">
              <strong className="block">
                Publication en cours de
                validation
              </strong>

              Les champs sont
              temporairement verrouillés.
              FLASCAM doit accepter ou
              refuser cette version avant
              toute modification.
            </div>
          )}

          {selectedArticle?.status ===
            'REJECTED' &&
            selectedArticle.rejectionReason && (
              <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 sm:m-6">
                <strong className="block">
                  Motif du refus
                </strong>

                {
                  selectedArticle.rejectionReason
                }
              </div>
            )}

          <form
            onSubmit={
              handleSubmit
            }
            className="p-4 sm:p-6"
          >
            <fieldset
              disabled={
                !canEdit ||
                saving
              }
              className="space-y-8 disabled:opacity-75"
            >
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-base font-black text-[#07355d]">
                  <FileText
                    size={
                      18
                    }
                    aria-hidden="true"
                  />

                  Contenu principal
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Type de contenu"
                    required
                  >
                    <select
                      value={
                        form.contentType
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateField(
                            'contentType',
                            event.target.value as NewsContentType,
                          )
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-[#07355d] outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
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
                            {
                              label
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field
                    label="Titre"
                    required
                    hint="Le lien de la publication est créé automatiquement à partir du titre."
                  >
                    <input
                      type="text"
                      required
                      maxLength={
                        255
                      }
                      value={
                        form.title
                      }
                      onChange={
                        handleTitleChange
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field
                      label="Résumé"
                      hint="Ce texte apparaît dans les cartes et les listes d’actualités."
                    >
                      <textarea
                        rows={
                          3
                        }
                        maxLength={
                          500
                        }
                        value={
                          form.excerpt
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateField(
                              'excerpt',
                              event.target.value,
                            )
                        }
                        className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                      />
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field
                      label="Contenu"
                      required
                    >
                      <textarea
                        rows={
                          12
                        }
                        required
                        value={
                          form.body
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateField(
                              'body',
                              event.target.value,
                            )
                        }
                        className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {hasEventFields && (
                <section className="border-t border-slate-200 pt-8">
                  <h3 className="mb-4 flex items-center gap-2 text-base font-black text-[#07355d]">
                    <CalendarDays
                      size={
                        18
                      }
                      aria-hidden="true"
                    />

                    Informations de
                    l’événement
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Field
                      label="Catégorie"
                      required
                    >
                      <select
                        required
                        value={
                          form.eventCategory
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateField(
                              'eventCategory',
                              event.target.value as NewsEventCategory,
                            )
                        }
                        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-[#07355d] outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
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
                              {
                                label
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </Field>

                    <Field label="Lieu">
                      <div className="relative">
                        <MapPin
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={
                            17
                          }
                          aria-hidden="true"
                        />

                        <input
                          type="text"
                          value={
                            form.eventLocation
                          }
                          onChange={
                            (
                              event,
                            ) =>
                              updateField(
                                'eventLocation',
                                event.target.value,
                              )
                          }
                          className="min-h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Début"
                      required
                    >
                      <input
                        type="datetime-local"
                        required
                        value={
                          form.eventStartAt
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateField(
                              'eventStartAt',
                              event.target.value,
                            )
                        }
                        className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                      />
                    </Field>

                    <Field label="Fin">
                      <input
                        type="datetime-local"
                        value={
                          form.eventEndAt
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateField(
                              'eventEndAt',
                              event.target.value,
                            )
                        }
                        className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                      />
                    </Field>
                  </div>
                </section>
              )}

              <section className="border-t border-slate-200 pt-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-base font-black text-[#07355d]">
                      <ImageIcon
                        size={
                          18
                        }
                        aria-hidden="true"
                      />

                      Images et vidéos
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Le premier média
                      sert de visuel
                      principal.
                    </p>
                  </div>

                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#0f5f9f] bg-white px-4 py-2.5 text-sm font-extrabold text-[#0f5f9f] transition hover:bg-[#eaf5ff]">
                    {uploading ? (
                      <Loader2
                        className="animate-spin"
                        size={
                          17
                        }
                        aria-hidden="true"
                      />
                    ) : (
                      <Upload
                        size={
                          17
                        }
                        aria-hidden="true"
                      />
                    )}

                    {uploading
                      ? 'Envoi...'
                      : 'Ajouter des médias'}

                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      disabled={
                        uploading ||
                        !canEdit
                      }
                      onChange={
                        handleMediaUpload
                      }
                      className="sr-only"
                    />
                  </label>
                </div>

                {form.media.length ===
                0 ? (
                  <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <div>
                      <ImageIcon
                        className="mx-auto text-slate-400"
                        size={
                          30
                        }
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-sm font-bold text-slate-600">
                        Aucun média ajouté
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {form.media.map(
                      (
                        media,
                        index,
                      ) => (
                        <article
                          key={
                            media.localId
                          }
                          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <div className="relative aspect-video bg-slate-900">
                            {media.mediaType ===
                            'IMAGE' ? (
                              // L’URL provient du stockage public sécurisé par le backend.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={
                                  media.url
                                }
                                alt={
                                  media.altText ||
                                  media.originalFilename
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <video
                                src={
                                  media.url
                                }
                                controls
                                preload="metadata"
                                className="h-full w-full object-contain"
                              />
                            )}

                            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-xs font-bold text-white">
                              {media.mediaType ===
                              'IMAGE' ? (
                                <ImageIcon
                                  size={
                                    13
                                  }
                                  aria-hidden="true"
                                />
                              ) : (
                                <Video
                                  size={
                                    13
                                  }
                                  aria-hidden="true"
                                />
                              )}

                              {index ===
                              0
                                ? 'Principal'
                                : `Média ${index + 1}`}
                            </span>
                          </div>

                          <div className="space-y-3 p-4">
                            <input
                              type="text"
                              value={
                                media.altText
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateMedia(
                                    index,
                                    'altText',
                                    event.target.value,
                                  )
                              }
                              placeholder="Texte alternatif de l’image"
                              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                            />

                            <input
                              type="text"
                              value={
                                media.caption
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateMedia(
                                    index,
                                    'caption',
                                    event.target.value,
                                  )
                              }
                              placeholder="Légende facultative"
                              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={
                                  () =>
                                    moveMedia(
                                      index,
                                      -1,
                                    )
                                }
                                disabled={
                                  index ===
                                  0
                                }
                                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-40"
                                aria-label="Déplacer avant"
                              >
                                <ArrowUp
                                  size={
                                    16
                                  }
                                  aria-hidden="true"
                                />
                              </button>

                              <button
                                type="button"
                                onClick={
                                  () =>
                                    moveMedia(
                                      index,
                                      1,
                                    )
                                }
                                disabled={
                                  index ===
                                  form.media.length -
                                    1
                                }
                                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-40"
                                aria-label="Déplacer après"
                              >
                                <ArrowDown
                                  size={
                                    16
                                  }
                                  aria-hidden="true"
                                />
                              </button>

                              <button
                                type="button"
                                onClick={
                                  () =>
                                    removeMedia(
                                      index,
                                    )
                                }
                                className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-extrabold text-red-700 hover:bg-red-50"
                              >
                                <Trash2
                                  size={
                                    15
                                  }
                                  aria-hidden="true"
                                />

                                Retirer
                              </button>
                            </div>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                )}
              </section>

              <section className="border-t border-slate-200 pt-8">
                <h3 className="mb-4 text-base font-black text-[#07355d]">
                  Référencement
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Titre SEO"
                    hint="Laissez vide pour utiliser le titre principal."
                  >
                    <input
                      type="text"
                      maxLength={
                        70
                      }
                      value={
                        form.seoTitle
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateField(
                            'seoTitle',
                            event.target.value,
                          )
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                    />
                  </Field>

                  <Field
                    label="Description SEO"
                    hint="Une phrase claire de 140 à 160 caractères."
                  >
                    <textarea
                      rows={
                        3
                      }
                      maxLength={
                        180
                      }
                      value={
                        form.seoDescription
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          updateField(
                            'seoDescription',
                            event.target.value,
                          )
                      }
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                    />
                  </Field>
                </div>
              </section>
            </fieldset>

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
              {canEdit && (
                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploading
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5f9f] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0b4f86] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      className="animate-spin"
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    <Save
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  )}

                  {selectedArticle
                    ? 'Enregistrer'
                    : 'Créer le brouillon'}
                </button>
              )}

              {canSubmit && (
                <button
                  type="button"
                  onClick={
                    () =>
                      void runArticleAction(
                        'submit',
                      )
                  }
                  disabled={
                    actionLoading !==
                      null ||
                    saving
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c96f4a] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#b75f3c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ===
                  'submit' ? (
                    <Loader2
                      className="animate-spin"
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    <Send
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  )}

                  Soumettre à FLASCAM
                </button>
              )}

              {canUnpublish && (
                <button
                  type="button"
                  onClick={
                    () =>
                      void runArticleAction(
                        'unpublish',
                      )
                  }
                  disabled={
                    actionLoading !==
                    null
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  {actionLoading ===
                  'unpublish' ? (
                    <Loader2
                      className="animate-spin"
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    <EyeOff
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  )}

                  Dépublier
                </button>
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={
                    () =>
                      void runArticleAction(
                        'delete',
                      )
                  }
                  disabled={
                    actionLoading !==
                    null
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-50 disabled:opacity-60 sm:ml-auto"
                >
                  {actionLoading ===
                  'delete' ? (
                    <Loader2
                      className="animate-spin"
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  ) : (
                    <Trash2
                      size={
                        17
                      }
                      aria-hidden="true"
                    />
                  )}

                  Supprimer
                </button>
              )}
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_14rem]">
              <label className="relative">
                <span className="sr-only">
                  Rechercher
                </span>

                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={
                    18
                  }
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={
                    (
                      event,
                    ) =>
                      setSearch(
                        event.target.value,
                      )
                  }
                  placeholder="Rechercher par titre ou contenu"
                  className="min-h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-sm outline-none transition focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
                />
              </label>

              <select
                value={
                  contentTypeFilter
                }
                onChange={
                  (
                    event,
                  ) =>
                    setContentTypeFilter(
                      event.target.value as
                        | NewsContentType
                        | '',
                    )
                }
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-[#07355d] outline-none focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
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
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>

              <select
                value={
                  statusFilter
                }
                onChange={
                  (
                    event,
                  ) =>
                    setStatusFilter(
                      event.target.value as
                        | NewsStatus
                        | '',
                    )
                }
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-[#07355d] outline-none focus:border-[#0f5f9f] focus:ring-4 focus:ring-[#0f5f9f]/10"
              >
                <option value="">
                  Tous les statuts
                </option>

                {Object.entries(
                  statusLabels,
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
                      {
                        label
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              {resultLabel}
            </p>
          </section>

          {loading ||
          loadingArticle ? (
            <LoadingBlock />
          ) : articles.length ===
            0 ? (
            <section className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <div>
                <Newspaper
                  className="mx-auto text-slate-400"
                  size={
                    40
                  }
                  aria-hidden="true"
                />

                <h2 className="mt-4 text-lg font-black text-[#07355d]">
                  Aucune publication
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Créez votre première
                  actualité ou votre
                  premier événement.
                </p>

                <button
                  type="button"
                  onClick={
                    openCreate
                  }
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#c96f4a] px-5 py-3 text-sm font-extrabold text-white"
                >
                  <Plus
                    size={
                      17
                    }
                    aria-hidden="true"
                  />

                  Créer un brouillon
                </button>
              </div>
            </section>
          ) : (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articles.map(
                (
                  article,
                ) => (
                  <article
                    key={
                      article.id
                    }
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#eaf5ff]">
                      {article.primaryMedia?.mediaType ===
                      'IMAGE' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            article.primaryMedia.url
                          }
                          alt={
                            article.primaryMedia.altText ||
                            article.title
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : article.primaryMedia?.mediaType ===
                        'VIDEO' ? (
                        <div className="grid h-full place-items-center">
                          <Video
                            size={
                              34
                            }
                            className="text-[#0f5f9f]"
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        <div className="grid h-full place-items-center">
                          <Newspaper
                            size={
                              34
                            }
                            className="text-[#0f5f9f]"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <span
                        className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass(
                          article.status,
                        )}`}
                      >
                        {
                          statusLabels[
                            article.status
                          ]
                        }
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#c96f4a]">
                        {
                          contentTypeLabels[
                            article.contentType
                          ]
                        }
                      </p>

                      <h2 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-[#07355d]">
                        {
                          article.title
                        }
                      </h2>

                      {article.excerpt && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {
                            article.excerpt
                          }
                        </p>
                      )}

                      <div className="mt-auto pt-5">
                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <Clock3
                            size={
                              14
                            }
                            aria-hidden="true"
                          />

                          Modifié le{' '}
                          {formatDate(
                            article.updatedAt,
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={
                            () =>
                              void openEdit(
                                article.id,
                              )
                          }
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#0f5f9f] bg-white px-4 text-sm font-extrabold text-[#0f5f9f] transition hover:bg-[#eaf5ff]"
                        >
                          {article.status ===
                          'PENDING_REVIEW' ? (
                            <Clock3
                              size={
                                16
                              }
                              aria-hidden="true"
                            />
                          ) : article.status ===
                            'PUBLISHED' ? (
                            <RotateCcw
                              size={
                                16
                              }
                              aria-hidden="true"
                            />
                          ) : (
                            <Pencil
                              size={
                                16
                              }
                              aria-hidden="true"
                            />
                          )}

                          {article.status ===
                          'PENDING_REVIEW'
                            ? 'Consulter'
                            : article.status ===
                                'PUBLISHED'
                              ? 'Gérer'
                              : 'Modifier'}
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </section>
          )}

          {totalPages >
            1 && (
            <nav
              aria-label="Pagination"
              className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <button
                type="button"
                disabled={
                  page <=
                  1
                }
                onClick={
                  () =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-[#07355d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft
                  size={
                    16
                  }
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Précédent
                </span>
              </button>

              <span className="text-sm font-extrabold text-slate-600">
                Page {page} sur{' '}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={
                  () =>
                    setPage(
                      (
                        current,
                      ) =>
                        Math.min(
                          totalPages,
                          current +
                            1,
                        ),
                    )
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-extrabold text-[#07355d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden sm:inline">
                  Suivant
                </span>

                <ArrowRight
                  size={
                    16
                  }
                  aria-hidden="true"
                />
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}