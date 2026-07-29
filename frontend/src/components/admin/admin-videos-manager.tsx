'use client';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  Archive,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  ExternalLink,
  FileVideo,
  ImageIcon,
  Loader2,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  X,
  XCircle,
  Video,
} from 'lucide-react';

import {
  getAdminAssociations,
} from '@/lib/associations-api';

import {
  approveAssociationVideo,
  cancelAdminVideoSchedule,
  createAdminVideo,
  createAssociationVideo,
  deleteAdminVideo,
  deleteAssociationVideo,
  getAdminVideoById,
  getAdminVideos,
  getAssociationVideoById,
  getAssociationVideos,
  rejectAssociationVideo,
  scheduleAdminVideo,
  submitAssociationVideo,
  unpublishAssociationVideo,
  updateAdminVideo,
  updateAdminVideoStatus,
  updateAssociationVideo,
  uploadAdminVideo,
  uploadAdminVideoThumbnail,
  uploadAssociationVideo,
  uploadAssociationVideoThumbnail,
  VIDEO_STATUS_LABELS,
} from '@/lib/videos-api';

import {
  EMPTY_VIDEO_FORM,
  slugifyVideoTitle,
  videoToForm,
} from '@/lib/video-form';

import type {
  AssociationSummary,
} from '@/types/associations';

import type {
  VideoFormState,
  VideoItem,
  VideoProvider,
  VideoStatus,
} from '@/types/videos';

type ManagerMode =
  | 'ADMIN'
  | 'ASSOCIATION';

type AdminVideosManagerProps = {
  mode: ManagerMode;
};

type EditorMode =
  | 'LIST'
  | 'CREATE'
  | 'EDIT';

const PAGE_SIZE = 10;

const providerLabels:
  Record<
    VideoProvider,
    string
  > = {
  YOUTUBE:
    'Lien YouTube',

  UPLOADED:
    'Vidéo importée',
};

const editableStatuses:
  VideoStatus[] = [
    'DRAFT',
    'REJECTED',
  ];

function cloneEmptyForm():
  VideoFormState {
  return {
    ...EMPTY_VIDEO_FORM,
  };
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return '—';
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
    return '—';
  }

  return new Intl.DateTimeFormat(
    'fr-MA',
    {
      dateStyle:
        'medium',

      timeStyle:
        'short',
    },
  ).format(date);
}

function formatSize(
  size?: number | null,
) {
  if (
    !size ||
    size <= 0
  ) {
    return '';
  }

  const units = [
    'octets',
    'Ko',
    'Mo',
    'Go',
  ];

  let value =
    size;

  let unitIndex =
    0;

  while (
    value >=
      1024 &&
    unitIndex <
      units.length -
        1
  ) {
    value /=
      1024;

    unitIndex +=
      1;
  }

  return `${value.toLocaleString(
    'fr-FR',
    {
      maximumFractionDigits:
        unitIndex ===
        0
          ? 0
          : 1,
    },
  )} ${units[unitIndex]}`;
}

function statusClasses(
  status: VideoStatus,
) {
  switch (status) {
    case 'PUBLISHED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'PENDING_REVIEW':
      return 'border-amber-200 bg-amber-50 text-amber-800';

    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700';

    case 'ARCHIVED':
      return 'border-slate-200 bg-slate-100 text-slate-600';

    default:
      return 'border-blue-200 bg-blue-50 text-blue-700';
  }
}

function videoThumbnail(
  video: VideoItem,
) {
  if (
    video.thumbnail?.url
  ) {
    return video.thumbnail.url;
  }

  if (
    video.provider ===
      'YOUTUBE' &&
    video.externalVideoId
  ) {
    return `https://i.ytimg.com/vi/${video.externalVideoId}/hqdefault.jpg`;
  }

  return null;
}

export function AdminVideosManager({
  mode,
}: AdminVideosManagerProps) {
  const isAdmin =
    mode ===
    'ADMIN';

  const [
    items,
    setItems,
  ] =
    useState<
      VideoItem[]
    >([]);

  const [
    associations,
    setAssociations,
  ] =
    useState<
      AssociationSummary[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
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
    useState(
      '',
    );

  const [
    success,
    setSuccess,
  ] =
    useState(
      '',
    );

  const [
    editorMode,
    setEditorMode,
  ] =
    useState<EditorMode>(
      'LIST',
    );

  const [
    selectedVideo,
    setSelectedVideo,
  ] =
    useState<
      VideoItem | null
    >(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<VideoFormState>(
      cloneEmptyForm,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false,
    );

  const [
    uploadingVideo,
    setUploadingVideo,
  ] =
    useState(
      false,
    );

  const [
    uploadingThumbnail,
    setUploadingThumbnail,
  ] =
    useState(
      false,
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      '',
    );

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState(
      '',
    );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      VideoStatus | ''
    >(
      '',
    );

  const [
    providerFilter,
    setProviderFilter,
  ] =
    useState<
      VideoProvider | ''
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

  const videoInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const thumbnailInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const canEditSelected =
    useMemo(
      () => {
        if (
          !selectedVideo
        ) {
          return true;
        }

        if (
          selectedVideo.sourceType ===
          'NEWS'
        ) {
          return false;
        }

        if (
          isAdmin
        ) {
          return true;
        }

        return editableStatuses.includes(
          selectedVideo.status,
        );
      },
      [
        isAdmin,
        selectedVideo,
      ],
    );

  const loadVideos =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError(
          '',
        );

        try {
          const response =
            isAdmin
              ? await getAdminVideos({
                  page,
                  limit:
                    PAGE_SIZE,
                  search:
                    appliedSearch,
                  status:
                    statusFilter,
                  provider:
                    providerFilter,
                })
              : await getAssociationVideos({
                  page,
                  limit:
                    PAGE_SIZE,
                  search:
                    appliedSearch,
                  status:
                    statusFilter,
                  provider:
                    providerFilter,
                });

          setItems(
            response.items,
          );

          setTotal(
            response.pagination.total,
          );

          setTotalPages(
            Math.max(
              response.pagination.totalPages,
              1,
            ),
          );
        } catch (
          caught
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Impossible de charger les vidéos.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        appliedSearch,
        isAdmin,
        page,
        providerFilter,
        statusFilter,
      ],
    );

  useEffect(
    () => {
      void loadVideos();
    },
    [
      loadVideos,
    ],
  );

  useEffect(
    () => {
      if (
        !isAdmin
      ) {
        return;
      }

      let active =
        true;

      async function loadAssociations() {
        try {
          const result =
            await getAdminAssociations();

          if (
            active
          ) {
            setAssociations(
              result.filter(
                (
                  association,
                ) =>
                  association.status !==
                  'ARCHIVED',
              ),
            );
          }
        } catch {
          /*
           * Le formulaire reste utilisable pour une vidéo FLASCAM
           * même si la liste des associations ne peut pas être chargée.
           */
        }
      }

      void loadAssociations();

      return () => {
        active =
          false;
      };
    },
    [
      isAdmin,
    ],
  );

  function resetMessages() {
    setError(
      '',
    );

    setSuccess(
      '',
    );
  }

  function beginCreate() {
    resetMessages();

    setSelectedVideo(
      null,
    );

    setForm(
      cloneEmptyForm(),
    );

    setEditorMode(
      'CREATE',
    );
  }

  async function beginEdit(
    video: VideoItem,
  ) {
    resetMessages();

    setActionLoading(
      video.id,
    );

    try {
      const fullVideo =
        isAdmin
          ? await getAdminVideoById(
              video.id,
            )
          : await getAssociationVideoById(
              video.id,
            );

      setSelectedVideo(
        fullVideo,
      );

      setForm(
        videoToForm(
          fullVideo,
        ),
      );

      setEditorMode(
        'EDIT',
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Impossible d’ouvrir cette vidéo.',
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  function closeEditor() {
    resetMessages();

    setEditorMode(
      'LIST',
    );

    setSelectedVideo(
      null,
    );

    setForm(
      cloneEmptyForm(),
    );
  }

  function updateForm<
    K extends keyof VideoFormState,
  >(
    key: K,
    value: VideoFormState[K],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );
  }

  function handleTitleChange(
    title: string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        title,

        slug:
          editorMode ===
            'CREATE'
            ? slugifyVideoTitle(
                title,
              )
            : current.slug,
      }),
    );
  }

  function handleProviderChange(
    provider: VideoProvider,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        provider,

        externalUrl:
          provider ===
          'YOUTUBE'
            ? current.externalUrl
            : '',

        mediaAssetId:
          provider ===
          'UPLOADED'
            ? current.mediaAssetId
            : '',

        mediaUrl:
          provider ===
          'UPLOADED'
            ? current.mediaUrl
            : '',

        mediaOriginalFilename:
          provider ===
          'UPLOADED'
            ? current.mediaOriginalFilename
            : '',
      }),
    );
  }

  async function handleVideoUpload(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const input =
      event.currentTarget;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    resetMessages();

    setUploadingVideo(
      true,
    );

    try {
      const uploaded =
        isAdmin
          ? await uploadAdminVideo(
              file,
            )
          : await uploadAssociationVideo(
              file,
            );

      setForm(
        (
          current,
        ) => ({
          ...current,

          provider:
            'UPLOADED',

          mediaAssetId:
            uploaded.id,

          mediaUrl:
            uploaded.url,

          mediaOriginalFilename:
            uploaded.originalFilename,
        }),
      );

      setSuccess(
        'La vidéo a été importée. Enregistrez maintenant la fiche.',
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Impossible d’importer la vidéo.',
      );
    } finally {
      setUploadingVideo(
        false,
      );

      input.value =
        '';
    }
  }

  async function handleThumbnailUpload(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const input =
      event.currentTarget;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    resetMessages();

    setUploadingThumbnail(
      true,
    );

    try {
      const uploaded =
        isAdmin
          ? await uploadAdminVideoThumbnail(
              file,
            )
          : await uploadAssociationVideoThumbnail(
              file,
            );

      setForm(
        (
          current,
        ) => ({
          ...current,

          thumbnailMediaAssetId:
            uploaded.id,

          thumbnailUrl:
            uploaded.url,

          thumbnailOriginalFilename:
            uploaded.originalFilename,
        }),
      );

      setSuccess(
        'La miniature a été importée.',
      );
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Impossible d’importer la miniature.',
      );
    } finally {
      setUploadingThumbnail(
        false,
      );

      input.value =
        '';
    }
  }

  function validateForm() {
    if (
      form.title.trim().length <
      3
    ) {
      return 'Le titre doit contenir au moins 3 caractères.';
    }

    if (
      !form.slug.trim()
    ) {
      return 'Le lien de la vidéo ne peut pas être généré.';
    }

    if (
      form.provider ===
        'YOUTUBE' &&
      !form.externalUrl.trim()
    ) {
      return 'Le lien YouTube est obligatoire.';
    }

    if (
      form.provider ===
        'UPLOADED' &&
      !form.mediaAssetId
    ) {
      return 'Importez un fichier vidéo avant d’enregistrer.';
    }

    return null;
  }

  async function handleSave(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    resetMessages();

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    setSaving(
      true,
    );

    try {
      let saved:
        VideoItem;

      if (
        editorMode ===
        'EDIT' &&
        selectedVideo
      ) {
        saved =
          isAdmin
            ? await updateAdminVideo(
                selectedVideo.id,
                form,
              )
            : await updateAssociationVideo(
                selectedVideo.id,
                form,
              );
      } else {
        saved =
          isAdmin
            ? await createAdminVideo(
                form,
              )
            : await createAssociationVideo(
                form,
              );
      }

      setSelectedVideo(
        saved,
      );

      setForm(
        videoToForm(
          saved,
        ),
      );

      setEditorMode(
        'EDIT',
      );

      setSuccess(
        isAdmin
          ? 'La vidéo a été enregistrée.'
          : 'La vidéo a été enregistrée en brouillon. Vous pouvez maintenant la soumettre à validation.',
      );

      await loadVideos();
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Impossible d’enregistrer la vidéo.',
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  async function runItemAction(
    videoId: string,
    action:
      () => Promise<unknown>,
    successMessage: string,
  ) {
    resetMessages();

    setActionLoading(
      videoId,
    );

    try {
      await action();

      setSuccess(
        successMessage,
      );

      await loadVideos();

      if (
        selectedVideo?.id ===
        videoId
      ) {
        const refreshed =
          isAdmin
            ? await getAdminVideoById(
                videoId,
              ).catch(
                () =>
                  null,
              )
            : await getAssociationVideoById(
                videoId,
              ).catch(
                () =>
                  null,
              );

        if (
          refreshed
        ) {
          setSelectedVideo(
            refreshed,
          );

          setForm(
            videoToForm(
              refreshed,
            ),
          );
        } else {
          closeEditor();
        }
      }
    } catch (
      caught
    ) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Action impossible.',
      );
    } finally {
      setActionLoading(
        null,
      );
    }
  }

  async function handleDelete(
    video: VideoItem,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer définitivement « ${video.title} » de l’interface ?`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    await runItemAction(
      video.id,
      () =>
        isAdmin
          ? deleteAdminVideo(
              video.id,
            )
          : deleteAssociationVideo(
              video.id,
            ),
      'La vidéo a été supprimée.',
    );
  }

  async function handleReject(
    video: VideoItem,
  ) {
    const reason =
      window.prompt(
        'Indiquez précisément la raison du rejet :',
      );

    if (
      reason ===
      null
    ) {
      return;
    }

    if (
      reason.trim().length <
      5
    ) {
      setError(
        'La raison du rejet doit contenir au moins 5 caractères.',
      );

      return;
    }

    await runItemAction(
      video.id,
      () =>
        rejectAssociationVideo(
          video.id,
          reason,
        ),
      'La vidéo a été rejetée. L’association pourra la corriger puis la soumettre de nouveau.',
    );
  }

  async function handleSchedule(
    video: VideoItem,
  ) {
    if (
      !form.scheduledAt
    ) {
      setError(
        'Choisissez une date et une heure de publication.',
      );

      return;
    }

    await runItemAction(
      video.id,
      () =>
        scheduleAdminVideo(
          video.id,
          form.scheduledAt,
        ),
      'La publication de la vidéo a été programmée.',
    );
  }

  const pageTitle =
    isAdmin
      ? 'Vidéothèque'
      : 'Mes vidéos';

  const pageDescription =
    isAdmin
      ? 'Créez les vidéos de la FLASCAM et validez les vidéos soumises par les associations.'
      : 'Ajoutez une vidéo indépendante puis soumettez-la à la FLASCAM avant sa publication.';

  if (
    editorMode !==
    'LIST'
  ) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <EditorHeader
          title={
            editorMode ===
            'CREATE'
              ? 'Nouvelle vidéo'
              : selectedVideo?.title ||
                'Modifier la vidéo'
          }
          description={
            selectedVideo?.sourceType ===
            'NEWS'
              ? 'Cette vidéo provient d’une actualité. Elle doit être modifiée depuis l’actualité correspondante.'
              : isAdmin
              ? 'Ajoutez un lien YouTube ou importez une vidéo indépendante.'
              : 'La vidéo restera invisible jusqu’à sa validation par un administrateur FLASCAM.'
          }
          onBack={
            closeEditor
          }
        />

        <Messages
          error={
            error
          }
          success={
            success
          }
        />

        <form
          onSubmit={
            handleSave
          }
          className="mt-6 space-y-6"
        >
          <section className="rounded-3xl border border-[#dbe5ef] bg-white p-5 shadow-sm sm:p-7">
            <SectionTitle
              title="Source de la vidéo"
              description="Choisissez la manière la plus simple d’ajouter votre contenu."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <ProviderButton
                active={
                  form.provider ===
                  'YOUTUBE'
                }
                disabled={
                  !canEditSelected
                }
                icon={
                  Video
                }
                title="Insérer un lien YouTube"
                description="La vidéo sera intégrée au site sans être copiée sur le serveur."
                onClick={() =>
                  handleProviderChange(
                    'YOUTUBE',
                  )
                }
              />

              <ProviderButton
                active={
                  form.provider ===
                  'UPLOADED'
                }
                disabled={
                  !canEditSelected
                }
                icon={
                  Upload
                }
                title="Importer une vidéo"
                description="Formats autorisés : MP4, WEBM et MOV."
                onClick={() =>
                  handleProviderChange(
                    'UPLOADED',
                  )
                }
              />
            </div>

            {form.provider ===
            'YOUTUBE' ? (
              <div className="mt-6">
                <Field
                  label="Lien YouTube"
                  required
                >
                  <input
                    type="url"
                    value={
                      form.externalUrl
                    }
                    disabled={
                      !canEditSelected
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        'externalUrl',
                        event.target.value,
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className={inputClass}
                  />
                </Field>

                {form.externalUrl && (
                  <a
                    href={
                      form.externalUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0f5f9f]"
                  >
                    Vérifier le lien sur YouTube

                    <ExternalLink
                      size={15}
                    />
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <input
                  ref={
                    videoInputRef
                  }
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                  disabled={
                    uploadingVideo ||
                    !canEditSelected
                  }
                  onChange={
                    handleVideoUpload
                  }
                />

                {form.mediaAssetId ? (
                  <div className="overflow-hidden rounded-2xl border border-[#dbe5ef] bg-[#f7fbff]">
                    {form.mediaUrl && (
                      <video
                        controls
                        preload="metadata"
                        src={
                          form.mediaUrl
                        }
                        className="aspect-video w-full bg-slate-950 object-contain"
                      />
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-extrabold text-[#07355d]">
                          {form.mediaOriginalFilename ||
                            'Vidéo importée'}
                        </p>

                        <p className="mt-1 text-xs text-[#6b7b8d]">
                          Le fichier est prêt à être rattaché à cette fiche.
                        </p>
                      </div>

                      {canEditSelected && (
                        <button
                          type="button"
                          onClick={() =>
                            videoInputRef.current?.click()
                          }
                          className={secondaryButtonClass}
                        >
                          <RefreshCw
                            size={16}
                          />

                          Remplacer
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={
                      uploadingVideo ||
                      !canEditSelected
                    }
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#b8cce0] bg-[#f7fbff] px-6 text-center transition hover:border-[#0f5f9f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2
                        size={30}
                        className="animate-spin text-[#0f5f9f]"
                      />
                    ) : (
                      <FileVideo
                        size={32}
                        className="text-[#0f5f9f]"
                      />
                    )}

                    <span className="mt-4 font-extrabold text-[#07355d]">
                      {uploadingVideo
                        ? 'Import en cours…'
                        : 'Choisir une vidéo'}
                    </span>

                    <span className="mt-2 text-sm text-[#6b7b8d]">
                      Taille maximale configurée par le serveur
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#dbe5ef] bg-white p-5 shadow-sm sm:p-7">
            <SectionTitle
              title="Informations"
              description="Ces informations seront visibles dans la vidéothèque publique."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Titre"
                required
              >
                <input
                  value={
                    form.title
                  }
                  disabled={
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    handleTitleChange(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>


            </div>

            <div className="mt-5">
              <Field label="Résumé">
                <textarea
                  value={
                    form.excerpt
                  }
                  disabled={
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      'excerpt',
                      event.target.value,
                    )
                  }
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Description">
                <textarea
                  value={
                    form.description
                  }
                  disabled={
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      'description',
                      event.target.value,
                    )
                  }
                  rows={7}
                  className={textareaClass}
                />
              </Field>
            </div>

            {isAdmin && (
              <div className="mt-5">
                <Field label="Auteur de la vidéo">
                  <select
                    value={
                      form.regionalAssociationId
                    }
                    disabled={
                      !canEditSelected
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        'regionalAssociationId',
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      FLASCAM
                    </option>

                    {associations.map(
                      (
                        association,
                      ) => (
                        <option
                          key={
                            association.id
                          }
                          value={
                            association.id
                          }
                        >
                          {association.acronym
                            ? `${association.acronym} — ${association.name}`
                            : association.name}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#dbe5ef] bg-white p-5 shadow-sm sm:p-7">
            <SectionTitle
              title="Miniature"
              description="Une miniature personnalisée est recommandée pour les vidéos importées."
            />

            <input
              ref={
                thumbnailInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={
                uploadingThumbnail ||
                !canEditSelected
              }
              onChange={
                handleThumbnailUpload
              }
            />

            <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,320px)_1fr]">
              <div className="aspect-video overflow-hidden rounded-2xl border border-[#dbe5ef] bg-[#07355d]">
                {form.thumbnailUrl ? (
                  <img
                    src={
                      form.thumbnailUrl
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-white/70">
                    <ImageIcon
                      size={34}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <p className="font-extrabold text-[#07355d]">
                  {form.thumbnailOriginalFilename ||
                    'Aucune miniature personnalisée'}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#6b7b8d]">
                  Formats JPG, PNG ou WEBP. Pour YouTube, la miniature de la vidéo sera utilisée automatiquement si vous n’en importez pas.
                </p>

                {canEditSelected && (
                  <button
                    type="button"
                    disabled={
                      uploadingThumbnail
                    }
                    onClick={() =>
                      thumbnailInputRef.current?.click()
                    }
                    className={`${secondaryButtonClass} mt-4 w-fit`}
                  >
                    {uploadingThumbnail ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload
                        size={16}
                      />
                    )}

                    {uploadingThumbnail
                      ? 'Import…'
                      : form.thumbnailMediaAssetId
                      ? 'Remplacer la miniature'
                      : 'Importer une miniature'}
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#dbe5ef] bg-white p-5 shadow-sm sm:p-7">
            <SectionTitle
              title="Référencement"
              description="Ces informations améliorent l’affichage de la vidéo dans les moteurs de recherche."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Titre SEO">
                <input
                  value={
                    form.seoTitle
                  }
                  disabled={
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      'seoTitle',
                      event.target.value,
                    )
                  }
                  maxLength={255}
                  className={inputClass}
                />
              </Field>

              <Field label="Ordre d’affichage">
                <input
                  type="number"
                  min={0}
                  value={
                    form.displayOrder
                  }
                  disabled={
                    !isAdmin ||
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      'displayOrder',
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Description SEO">
                <textarea
                  value={
                    form.seoDescription
                  }
                  disabled={
                    !canEditSelected
                  }
                  onChange={(
                    event,
                  ) =>
                    updateForm(
                      'seoDescription',
                      event.target.value,
                    )
                  }
                  maxLength={320}
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>

          </section>

          <div className="sticky bottom-4 z-20 rounded-2xl border border-[#dbe5ef] bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={
                  closeEditor
                }
                className={secondaryButtonClass}
              >
                <ChevronLeft
                  size={17}
                />

                Retour
              </button>

              <div className="flex flex-wrap gap-3">
                {canEditSelected && (
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploadingVideo ||
                      uploadingThumbnail
                    }
                    className={primaryButtonClass}
                  >
                    {saving ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={17}
                      />
                    )}

                    Enregistrer
                  </button>
                )}

                {selectedVideo && (
                  <EditorActions
                    video={
                      selectedVideo
                    }
                    isAdmin={
                      isAdmin
                    }
                    loading={
                      actionLoading ===
                      selectedVideo.id
                    }
                    scheduledAt={
                      form.scheduledAt
                    }
                    onScheduleDateChange={(
                      value,
                    ) =>
                      updateForm(
                        'scheduledAt',
                        value,
                      )
                    }
                    onPublish={() =>
                      runItemAction(
                        selectedVideo.id,
                        () =>
                          updateAdminVideoStatus(
                            selectedVideo.id,
                            'PUBLISHED',
                          ),
                        'La vidéo est maintenant publiée.',
                      )
                    }
                    onArchive={() =>
                      runItemAction(
                        selectedVideo.id,
                        () =>
                          updateAdminVideoStatus(
                            selectedVideo.id,
                            'ARCHIVED',
                          ),
                        'La vidéo a été archivée.',
                      )
                    }
                    onApprove={() =>
                      runItemAction(
                        selectedVideo.id,
                        () =>
                          approveAssociationVideo(
                            selectedVideo.id,
                          ),
                        'La vidéo a été approuvée et publiée.',
                      )
                    }
                    onReject={() =>
                      handleReject(
                        selectedVideo,
                      )
                    }
                    onSubmit={() =>
                      runItemAction(
                        selectedVideo.id,
                        () =>
                          submitAssociationVideo(
                            selectedVideo.id,
                          ),
                        'La vidéo a été soumise à la FLASCAM.',
                      )
                    }
onUnpublish={() =>
  runItemAction(
    selectedVideo.id,
    () =>
      isAdmin
        ? updateAdminVideoStatus(
            selectedVideo.id,
            'DRAFT',
          )
        : unpublishAssociationVideo(
            selectedVideo.id,
          ),
    'La vidéo a été dépubliée et replacée en brouillon.',
  )
}
                    onSchedule={() =>
                      handleSchedule(
                        selectedVideo,
                      )
                    }
                    onCancelSchedule={() =>
                      runItemAction(
                        selectedVideo.id,
                        () =>
                          cancelAdminVideoSchedule(
                            selectedVideo.id,
                          ),
                        'La programmation a été annulée.',
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        selectedVideo,
                      )
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#07355d] sm:text-4xl">
            {pageTitle}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#536273] sm:text-base">
            {pageDescription}
          </p>
        </div>

        <button
          type="button"
          onClick={
            beginCreate
          }
          className={primaryButtonClass}
        >
          <Plus
            size={18}
          />

          Ajouter une vidéo
        </button>
      </div>

      <Messages
        error={
          error
        }
        success={
          success
        }
      />

      <section className="mt-7 rounded-3xl border border-[#dbe5ef] bg-white p-4 shadow-sm sm:p-5">
        <form
          onSubmit={(
            event,
          ) => {
            event.preventDefault();

            setPage(
              1,
            );

            setAppliedSearch(
              search.trim(),
            );
          }}
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
        >
          <label className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#789]"
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
              placeholder="Rechercher une vidéo"
              className={`${inputClass} pl-11`}
            />
          </label>

          <select
            value={
              statusFilter
            }
            onChange={(
              event,
            ) => {
              setStatusFilter(
                event.target.value as
                  | VideoStatus
                  | '',
              );

              setPage(
                1,
              );
            }}
            className={inputClass}
          >
            <option value="">
              Tous les statuts
            </option>

            {Object.entries(
              VIDEO_STATUS_LABELS,
            ).map(
              ([
                value,
                label,
              ]) => (
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
              providerFilter
            }
            onChange={(
              event,
            ) => {
              setProviderFilter(
                event.target.value as
                  | VideoProvider
                  | '',
              );

              setPage(
                1,
              );
            }}
            className={inputClass}
          >
            <option value="">
              Toutes les sources
            </option>

            <option value="YOUTUBE">
              YouTube
            </option>

            <option value="UPLOADED">
              Vidéo importée
            </option>
          </select>

          <button
            type="submit"
            className={primaryButtonClass}
          >
            Rechercher
          </button>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#6b7b8d]">
          {total}{' '}
          {total > 1
            ? 'vidéos'
            : 'vidéo'}
        </p>

        <button
          type="button"
          onClick={() =>
            void loadVideos()
          }
          className={secondaryButtonClass}
        >
          <RefreshCw
            size={16}
          />

          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid min-h-72 place-items-center rounded-3xl border border-[#dbe5ef] bg-white">
          <Loader2
            size={32}
            className="animate-spin text-[#0f5f9f]"
          />
        </div>
      ) : items.length ===
        0 ? (
        <div className="mt-6 grid min-h-72 place-items-center rounded-3xl border border-dashed border-[#b8cce0] bg-white px-6 text-center">
          <div>
            <CirclePlay
              size={38}
              className="mx-auto text-[#0f5f9f]"
            />

            <h2 className="mt-4 text-xl font-extrabold text-[#07355d]">
              Aucune vidéo
            </h2>

            <p className="mt-2 text-sm leading-7 text-[#6b7b8d]">
              Commencez par ajouter un lien YouTube ou importer une vidéo.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map(
            (
              video,
            ) => (
              <AdminVideoCard
                key={
                  video.id
                }
                video={
                  video
                }
                isAdmin={
                  isAdmin
                }
                loading={
                  actionLoading ===
                  video.id
                }
                onOpen={() =>
                  beginEdit(
                    video,
                  )
                }
                onApprove={() =>
                  runItemAction(
                    video.id,
                    () =>
                      approveAssociationVideo(
                        video.id,
                      ),
                    'La vidéo a été approuvée et publiée.',
                  )
                }
                onReject={() =>
                  handleReject(
                    video,
                  )
                }
                onSubmit={() =>
                  runItemAction(
                    video.id,
                    () =>
                      submitAssociationVideo(
                        video.id,
                      ),
                    'La vidéo a été soumise à validation.',
                  )
                }
              />
            ),
          )}
        </div>
      )}

      {totalPages >
        1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={
              page <=
              1
            }
            onClick={() =>
              setPage(
                (
                  current,
                ) =>
                  Math.max(
                    current -
                      1,
                    1,
                  ),
              )
            }
            className={paginationButtonClass}
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <span className="text-sm font-extrabold text-[#07355d]">
            Page {page} sur{' '}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >=
              totalPages
            }
            onClick={() =>
              setPage(
                (
                  current,
                ) =>
                  Math.min(
                    current +
                      1,
                    totalPages,
                  ),
              )
            }
            className={paginationButtonClass}
          >
            <ChevronRight
              size={18}
            />
          </button>
        </div>
      )}
    </div>
  );
}

function AdminVideoCard({
  video,
  isAdmin,
  loading,
  onOpen,
  onApprove,
  onReject,
  onSubmit,
}: {
  video: VideoItem;
  isAdmin: boolean;
  loading: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSubmit: () => void;
}) {
  const thumbnail =
    videoThumbnail(
      video,
    );

  return (
    <article className="overflow-hidden rounded-3xl border border-[#dbe5ef] bg-white shadow-sm">
      <button
        type="button"
        onClick={
          onOpen
        }
        className="relative block aspect-video w-full overflow-hidden bg-[#07355d] text-left"
      >
        {thumbnail ? (
          <img
            src={
              thumbnail
            }
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full place-items-center text-white/60">
            <FileVideo
              size={36}
            />
          </span>
        )}

        <span className="absolute inset-0 bg-slate-950/15" />

        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-[#07355d]">
          {providerLabels[
            video.provider
          ]}
        </span>

        {loading && (
          <span className="absolute inset-0 grid place-items-center bg-slate-950/40">
            <Loader2
              size={28}
              className="animate-spin text-white"
            />
          </span>
        )}
      </button>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-extrabold ${statusClasses(
              video.status,
            )}`}
          >
            {VIDEO_STATUS_LABELS[
              video.status
            ]}
          </span>

          {video.sourceType ===
            'NEWS' && (
            <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700">
              Issue d’une actualité
            </span>
          )}
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg font-black leading-snug text-[#07355d]">
          {video.title}
        </h2>

        <p className="mt-2 text-sm font-semibold text-[#6b7b8d]">
          {video.association?.name ||
            'FLASCAM'}
        </p>

        <p className="mt-3 text-xs text-[#7a8998]">
          Mise à jour le{' '}
          {formatDate(
            video.updatedAt,
          )}
        </p>

        {video.rejectionReason && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
            <strong>
              Motif du rejet :
            </strong>{' '}
            {video.rejectionReason}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              onOpen
            }
            className={secondaryButtonClass}
          >
            {video.sourceType ===
            'NEWS' ? (
              <Play
                size={16}
              />
            ) : (
              <Pencil
                size={16}
              />
            )}

            {video.sourceType ===
            'NEWS'
              ? 'Consulter'
              : 'Ouvrir'}
          </button>

          {isAdmin &&
            video.status ===
              'PENDING_REVIEW' && (
              <>
                <button
                  type="button"
                  onClick={
                    onApprove
                  }
                  disabled={
                    loading
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check
                    size={16}
                  />

                  Approuver
                </button>

                <button
                  type="button"
                  onClick={
                    onReject
                  }
                  disabled={
                    loading
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <X
                    size={16}
                  />

                  Rejeter
                </button>
              </>
            )}

          {!isAdmin &&
            [
              'DRAFT',
              'REJECTED',
            ].includes(
              video.status,
            ) &&
            video.sourceType ===
              'STANDALONE' && (
              <button
                type="button"
                onClick={
                  onSubmit
                }
                disabled={
                  loading
                }
                className={primaryButtonClass}
              >
                <Send
                  size={16}
                />

                Soumettre
              </button>
            )}
        </div>
      </div>
    </article>
  );
}

function EditorActions({
  video,
  isAdmin,
  loading,
  scheduledAt,
  onScheduleDateChange,
  onPublish,
  onArchive,
  onApprove,
  onReject,
  onSubmit,
  onUnpublish,
  onSchedule,
  onCancelSchedule,
  onDelete,
}: {
  video: VideoItem;
  isAdmin: boolean;
  loading: boolean;
  scheduledAt: string;
  onScheduleDateChange: (
    value: string,
  ) => void;
  onPublish: () => void;
  onArchive: () => void;
  onApprove: () => void;
  onReject: () => void;
  onSubmit: () => void;
  onUnpublish: () => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
  onDelete: () => void;
}) {
  if (
    video.sourceType ===
    'NEWS'
  ) {
    return (
      <Link
        href="/admin/news"
        className={secondaryButtonClass}
      >
        <ExternalLink
          size={16}
        />

        Ouvrir les actualités
      </Link>
    );
  }

  if (
    isAdmin
  ) {
    return (
      <>
        {video.status ===
          'PENDING_REVIEW' && (
          <>
            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onApprove
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2
                size={17}
              />

              Approuver
            </button>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onReject
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle
                size={17}
              />

              Rejeter
            </button>
          </>
        )}

        {video.status !==
          'PUBLISHED' &&
          video.status !==
            'PENDING_REVIEW' && (
            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onPublish
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Play
                size={17}
              />

              Publier
            </button>
          )}

{video.status ===
  'PUBLISHED' && (
  <>
    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        onUnpublish
      }
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-extrabold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <RefreshCw
        size={17}
      />

      Dépublier
    </button>

    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        onArchive
      }
      className={secondaryButtonClass}
    >
      <Archive
        size={17}
      />

      Archiver
    </button>
  </>
)}

        {video.status ===
          'DRAFT' &&
          !video.association && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={
                scheduledAt
              }
              onChange={(
                event,
              ) =>
                onScheduleDateChange(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-xl border border-[#c9d6e2] px-3 text-sm text-[#07355d]"
            />

            <button
              type="button"
              disabled={
                loading ||
                !scheduledAt
              }
              onClick={
                onSchedule
              }
              className={secondaryButtonClass}
            >
              <CalendarClock
                size={17}
              />

              Programmer
            </button>
          </div>
        )}

        {video.scheduledAt && (
          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onCancelSchedule
            }
            className={secondaryButtonClass}
          >
            <Clock3
              size={17}
            />

            Annuler la programmation
          </button>
        )}

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onDelete
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2
            size={17}
          />

          Supprimer
        </button>
      </>
    );
  }

  return (
    <>
      {[
        'DRAFT',
        'REJECTED',
      ].includes(
        video.status,
      ) && (
        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onSubmit
          }
          className={primaryButtonClass}
        >
          <Send
            size={17}
          />

          Soumettre à validation
        </button>
      )}

      {video.status ===
        'PUBLISHED' && (
        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onUnpublish
          }
          className={secondaryButtonClass}
        >
          <Archive
            size={17}
          />

          Dépublier
        </button>
      )}

      {video.status !==
        'PENDING_REVIEW' && (
        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            onDelete
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"
        >
          <Trash2
            size={17}
          />

          Supprimer
        </button>
      )}
    </>
  );
}

function EditorHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <button
        type="button"
        onClick={
          onBack
        }
        className={paginationButtonClass}
        aria-label="Retour à la liste"
      >
        <ChevronLeft
          size={20}
        />
      </button>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0f5f9f]">
          Vidéothèque
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#07355d]">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#536273]">
          {description}
        </p>
      </div>
    </div>
  );
}

function ProviderButton({
  active,
  disabled,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  icon: typeof Video;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className={`
        flex
        min-h-32
        items-start
        gap-4
        rounded-2xl
        border
        p-5
        text-left
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${
          active
            ? 'border-[#0f5f9f] bg-[#edf7ff] ring-4 ring-[#0f5f9f]/10'
            : 'border-[#dbe5ef] bg-white hover:border-[#0f5f9f]/50'
        }
      `}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#07355d] text-white">
        <Icon
          size={22}
        />
      </span>

      <span>
        <span className="block font-black text-[#07355d]">
          {title}
        </span>

        <span className="mt-2 block text-sm leading-6 text-[#6b7b8d]">
          {description}
        </span>
      </span>
    </button>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-black text-[#07355d]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[#6b7b8d]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-[#07355d]">
        {label}

        {required && (
          <span className="text-red-600">
            {' '}*
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function Messages({
  error,
  success,
}: {
  error: string;
  success: string;
}) {
  return (
    <>
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          {success}
        </div>
      )}
    </>
  );
}

const inputClass =
  `
    min-h-12
    w-full
    rounded-xl
    border
    border-[#c9d6e2]
    bg-white
    px-4
    text-sm
    text-[#07355d]
    outline-none
    transition
    placeholder:text-[#8b99a8]
    focus:border-[#0f5f9f]
    focus:ring-4
    focus:ring-[#0f5f9f]/10
    disabled:cursor-not-allowed
    disabled:bg-slate-50
    disabled:text-slate-500
  `;

const textareaClass =
  `
    w-full
    resize-y
    rounded-xl
    border
    border-[#c9d6e2]
    bg-white
    px-4
    py-3
    text-sm
    leading-7
    text-[#07355d]
    outline-none
    transition
    placeholder:text-[#8b99a8]
    focus:border-[#0f5f9f]
    focus:ring-4
    focus:ring-[#0f5f9f]/10
    disabled:cursor-not-allowed
    disabled:bg-slate-50
    disabled:text-slate-500
  `;

const primaryButtonClass =
  `
    inline-flex
    min-h-11
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-[#0f5f9f]
    px-5
    text-sm
    font-extrabold
    text-white
    transition
    hover:bg-[#07355d]
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

const secondaryButtonClass =
  `
    inline-flex
    min-h-10
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-[#c9d6e2]
    bg-white
    px-4
    text-sm
    font-extrabold
    text-[#07355d]
    transition
    hover:border-[#0f5f9f]
    hover:text-[#0f5f9f]
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

const paginationButtonClass =
  `
    grid
    size-11
    place-items-center
    rounded-xl
    border
    border-[#c9d6e2]
    bg-white
    text-[#07355d]
    transition
    hover:border-[#0f5f9f]
    hover:text-[#0f5f9f]
    disabled:cursor-not-allowed
    disabled:opacity-40
  `;