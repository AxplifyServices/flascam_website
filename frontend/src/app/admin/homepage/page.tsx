'use client';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Home,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import {
  HomepageHeroPositionEditor,
} from '@/components/admin/homepage-hero-position-editor';

import type {
  HeroImagePositions,
} from '@/components/admin/homepage-hero-position-editor';

import {
  createHomepageHeroSlide,
  deleteHomepageHeroSlide,
  getAdminHomepageHeroSlides,
  reorderHomepageHeroSlides,
  updateHomepageHeroSlide,
  uploadHomepageHeroImage,
} from '@/lib/homepage-hero-api';

import type {
  HomepageHeroSlide,
} from '@/types/homepage-hero';

type SlideFormState = {
  title: string;
  altText: string;
  isPublished: boolean;
  positions: HeroImagePositions;
};

const createEmptyForm =
  (): SlideFormState => ({
    title: '',
    altText: '',
    isPublished: true,
    positions: {
      desktopPositionX: 50,
      desktopPositionY: 50,
      mobilePositionX: 50,
      mobilePositionY: 50,
    },
  });

function sortSlides(
  slides: HomepageHeroSlide[],
) {
  return [...slides].sort(
    (first, second) =>
      first.displayOrder -
        second.displayOrder ||
      first.id.localeCompare(
        second.id,
      ),
  );
}

export default function AdminHomepagePage() {
  const [
    slides,
    setSlides,
  ] = useState<
    HomepageHeroSlide[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    movingId,
    setMovingId,
  ] = useState<
    string | null
  >(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    editingSlide,
    setEditingSlide,
  ] = useState<
    HomepageHeroSlide | null
  >(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<
    File | null
  >(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState<
    string | null
  >(null);

  const [
    form,
    setForm,
  ] = useState<SlideFormState>(
  createEmptyForm,
);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  const orderedSlides =
    useMemo(
      () =>
        sortSlides(slides),
      [slides],
    );

  const publishedCount =
    useMemo(
      () =>
        slides.filter(
          (slide) =>
            slide.isPublished,
        ).length,
      [slides],
    );

  useEffect(() => {
    let active = true;

    async function loadSlides() {
      setLoading(true);
      setError(null);

      try {
        const data =
          await getAdminHomepageHeroSlides();

        if (active) {
          setSlides(
            sortSlides(data),
          );
        }
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Une erreur est survenue.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSlides();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    };
  }, [
    previewUrl,
  ]);

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  function resetForm() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setEditingSlide(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setForm(
  createEmptyForm(),
);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    clearMessages();

    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (
      !file.type.startsWith(
        'image/',
      )
    ) {
      setError(
        'Le fichier sélectionné doit être une image.',
      );

      event.target.value = '';
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        'La taille maximale autorisée est de 10 Mo.',
      );

      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(file);
    setPreviewUrl(
      URL.createObjectURL(file),
    );

    if (!form.altText) {
      setForm(
        (current) => ({
          ...current,
          altText:
            file.name
              .replace(
                /\.[^.]+$/,
                '',
              )
              .replace(
                /[-_]+/g,
                ' ',
              ),
        }),
      );
    }
  }

  function startEditing(
    slide: HomepageHeroSlide,
  ) {
    clearMessages();

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingSlide(slide);

setForm({
  title:
    slide.title ?? '',
  altText:
    slide.altText,
  isPublished:
    slide.isPublished,
  positions: {
    desktopPositionX:
      slide.desktopPositionX,
    desktopPositionY:
      slide.desktopPositionY,
    mobilePositionX:
      slide.mobilePositionX,
    mobilePositionY:
      slide.mobilePositionY,
  },
});

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    clearMessages();

    const altText =
      form.altText.trim();

    if (!altText) {
      setError(
        'Le texte alternatif de l’image est obligatoire.',
      );
      return;
    }

    if (
      !editingSlide &&
      !selectedFile
    ) {
      setError(
        'Sélectionnez une image à importer.',
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingSlide) {
        const updated =
          await updateHomepageHeroSlide(
            editingSlide.id,
{
  title:
    form.title.trim(),
  altText,
  isPublished:
    form.isPublished,
  ...form.positions,
},
          );

        setSlides(
          (current) =>
            sortSlides(
              current.map(
                (slide) =>
                  slide.id ===
                  updated.id
                    ? updated
                    : slide,
              ),
            ),
        );

        setSuccess(
          'L’image a été modifiée.',
        );
      } else {
        const uploaded =
          await uploadHomepageHeroImage(
            selectedFile!,
          );

        const created =
          await createHomepageHeroSlide(
            {
              mediaAssetId:
                uploaded.id,
              title:
                form.title.trim() ||
                undefined,
              altText,
              displayOrder:
                orderedSlides.length,
isPublished:
  form.isPublished,
...form.positions,
            },
          );

        setSlides(
          (current) =>
            sortSlides([
              ...current,
              created,
            ]),
        );

        setSuccess(
          'L’image a été ajoutée au diaporama.',
        );
      }

      resetForm();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Une erreur est survenue.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublished(
    slide: HomepageHeroSlide,
  ) {
    clearMessages();

    try {
      const updated =
        await updateHomepageHeroSlide(
          slide.id,
          {
            isPublished:
              !slide.isPublished,
          },
        );

      setSlides(
        (current) =>
          current.map(
            (item) =>
              item.id === updated.id
                ? updated
                : item,
          ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de modifier la publication.',
      );
    }
  }

  async function moveSlide(
    slideId: string,
    direction:
      | 'up'
      | 'down',
  ) {
    clearMessages();

    const currentIndex =
      orderedSlides.findIndex(
        (slide) =>
          slide.id === slideId,
      );

    const targetIndex =
      direction === 'up'
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >=
        orderedSlides.length
    ) {
      return;
    }

    const reordered =
      [...orderedSlides];

    const [
      movedSlide,
    ] = reordered.splice(
      currentIndex,
      1,
    );

    reordered.splice(
      targetIndex,
      0,
      movedSlide,
    );

    setMovingId(slideId);

    try {
      const updatedSlides =
        await reorderHomepageHeroSlides(
          reordered.map(
            (slide) =>
              slide.id,
          ),
        );

      setSlides(
        sortSlides(
          updatedSlides,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de modifier l’ordre.',
      );
    } finally {
      setMovingId(null);
    }
  }

  async function removeSlide(
    slide: HomepageHeroSlide,
  ) {
    const confirmed =
      window.confirm(
        `Supprimer définitivement l’image « ${slide.altText} » du diaporama ?`,
      );

    if (!confirmed) {
      return;
    }

    clearMessages();
    setDeletingId(slide.id);

    try {
      await deleteHomepageHeroSlide(
        slide.id,
      );

      const remaining =
        orderedSlides.filter(
          (item) =>
            item.id !== slide.id,
        );

      setSlides(remaining);

      await Promise.all(
        remaining.map(
          (item, index) => {
            if (
              item.displayOrder ===
              index
            ) {
              return Promise.resolve(
                item,
              );
            }

            return updateHomepageHeroSlide(
              item.id,
              {
                displayOrder:
                  index,
              },
            );
          },
        ),
      );

      setSlides(
        remaining.map(
          (item, index) => ({
            ...item,
            displayOrder:
              index,
          }),
        ),
      );

      if (
        editingSlide?.id ===
        slide.id
      ) {
        resetForm();
      }

      setSuccess(
        'L’image a été supprimée du diaporama.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de supprimer cette image.',
      );
    } finally {
      setDeletingId(null);
    }
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
          lg:p-8
        "
      >
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
          <Home size={16} />
          Page d’accueil
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
          Images du diaporama
        </h1>

        <p
          className="
            mt-3
            max-w-3xl
            text-sm
            leading-6
            text-[var(--flascam-slate)]
            sm:text-base
          "
        >
          Importez les images affichées sur la page
          d’accueil, choisissez leur ordre et
          publiez uniquement celles qui doivent être
          visibles.
        </p>

        <div
          className="
            mt-5
            flex
            flex-wrap
            gap-3
          "
        >
          <span
            className="
              rounded-full
              bg-white
              px-4
              py-2
              text-sm
              font-bold
              text-slate-700
              shadow-sm
            "
          >
            {slides.length} image
            {slides.length > 1
              ? 's'
              : ''}
          </span>

          <span
            className="
              rounded-full
              bg-emerald-50
              px-4
              py-2
              text-sm
              font-bold
              text-emerald-700
            "
          >
            {publishedCount} publiée
            {publishedCount > 1
              ? 's'
              : ''}
          </span>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="
            mt-5
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-semibold
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="
            mt-5
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            px-4
            py-3
            text-sm
            font-semibold
            text-emerald-700
          "
        >
          {success}
        </div>
      )}

      <div
        className="
          mt-6
          grid
          gap-6
          xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]
        "
      >
        <form
          onSubmit={submit}
          className="
            h-fit
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-extrabold
                  text-slate-950
                "
              >
                {editingSlide
                  ? 'Modifier l’image'
                  : 'Ajouter une image'}
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--flascam-slate)]
                "
              >
                Formats acceptés : JPG, PNG,
                WEBP ou SVG, maximum 10 Mo.
              </p>
            </div>

            {editingSlide && (
              <button
                type="button"
                onClick={resetForm}
                className="
                  grid
                  size-10
                  place-items-center
                  rounded-full
                  border
                  border-[var(--flascam-border)]
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
                aria-label="Annuler la modification"
              >
                <X size={18} />
              </button>
            )}
          </div>

{!editingSlide && (
  <label
    className="
      mt-5
      flex
      min-h-52
      cursor-pointer
      flex-col
      items-center
      justify-center
      overflow-hidden
      rounded-2xl
      border-2
      border-dashed
      border-[#b9d5e8]
      bg-[#f8fbff]
      text-center
      transition
      hover:border-[var(--flascam-blue)]
    "
  >
    {previewUrl ? (
      <div
        className="
          relative
          h-52
          w-full
          overflow-hidden
        "
      >
        <img
          src={previewUrl}
          alt="Aperçu de l’image sélectionnée"
          className="
            absolute
            inset-0
            size-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            bg-[#07355d]/75
            px-4
            py-2
            text-xs
            font-bold
            text-white
            backdrop-blur-sm
          "
        >
          Appuyez pour choisir une autre image
        </div>
      </div>
    ) : (
      <div className="px-6 py-8">
        <div
          className="
            mx-auto
            grid
            size-14
            place-items-center
            rounded-2xl
            bg-[#eaf5ff]
            text-[var(--flascam-blue)]
          "
        >
          <ImagePlus
            size={25}
          />
        </div>

        <p
          className="
            mt-4
            text-sm
            font-extrabold
            text-slate-900
          "
        >
          Sélectionner une image
        </p>

        <p
          className="
            mt-1
            text-xs
            text-[var(--flascam-slate)]
          "
        >
          Appuyez ici pour parcourir vos fichiers
        </p>
      </div>
    )}

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp,image/svg+xml"
      onChange={
        handleFileChange
      }
      className="sr-only"
    />
  </label>
)}

{(
  previewUrl ||
  editingSlide
) && (
  <HomepageHeroPositionEditor
    imageUrl={
      previewUrl ??
      editingSlide!.imageUrl
    }
    altText={
      form.altText ||
      editingSlide?.altText ||
      'Aperçu du cadrage'
    }
    value={
      form.positions
    }
    onChange={(
      positions,
    ) => {
      setForm(
        (current) => ({
          ...current,
          positions,
        }),
      );
    }}
  />
)}          

          <label
            className="
              mt-5
              block
            "
          >
            <span
              className="
                text-sm
                font-bold
                text-slate-800
              "
            >
              Titre facultatif
            </span>

            <input
              value={form.title}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }),
                )
              }
              maxLength={180}
              className="
                mt-2
                h-12
                w-full
                rounded-2xl
                border
                border-[var(--flascam-border)]
                bg-white
                px-4
                text-sm
                outline-none
                transition
                focus:border-[var(--flascam-blue)]
                focus:ring-4
                focus:ring-[#dcefff]
              "
            />
          </label>

          <label
            className="
              mt-4
              block
            "
          >
            <span
              className="
                text-sm
                font-bold
                text-slate-800
              "
            >
              Texte alternatif
            </span>

            <span
              className="
                ml-1
                text-red-600
              "
            >
              *
            </span>

            <textarea
              value={form.altText}
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    altText:
                      event.target.value,
                  }),
                )
              }
              maxLength={255}
              rows={3}
              required
              className="
                mt-2
                w-full
                resize-none
                rounded-2xl
                border
                border-[var(--flascam-border)]
                bg-white
                px-4
                py-3
                text-sm
                leading-6
                outline-none
                transition
                focus:border-[var(--flascam-blue)]
                focus:ring-4
                focus:ring-[#dcefff]
              "
            />

            <span
              className="
                mt-1
                block
                text-xs
                leading-5
                text-[var(--flascam-slate)]
              "
            >
              Décrivez précisément l’image pour
              l’accessibilité et le référencement.
            </span>
          </label>

          <label
            className="
              mt-4
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-2xl
              border
              border-[var(--flascam-border)]
              bg-[#f8fbff]
              p-4
            "
          >
            <input
              type="checkbox"
              checked={
                form.isPublished
              }
              onChange={(event) =>
                setForm(
                  (current) => ({
                    ...current,
                    isPublished:
                      event.target.checked,
                  }),
                )
              }
              className="
                mt-1
                size-4
                accent-[var(--flascam-blue)]
              "
            />

            <span>
              <span
                className="
                  block
                  text-sm
                  font-extrabold
                  text-slate-900
                "
              >
                Publier cette image
              </span>

              <span
                className="
                  mt-1
                  block
                  text-xs
                  leading-5
                  text-[var(--flascam-slate)]
                "
              >
                Une image non publiée reste
                enregistrée, mais n’apparaît pas sur
                le site.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="
              mt-5
              flex
              h-12
              w-full
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
              hover:brightness-95
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting ? (
              <LoaderCircle
                size={19}
                className="animate-spin"
              />
            ) : editingSlide ? (
              <Save size={19} />
            ) : (
              <Upload size={19} />
            )}

            {submitting
              ? 'Enregistrement…'
              : editingSlide
                ? 'Enregistrer les modifications'
                : 'Importer et ajouter'}
          </button>
        </form>

        <div
          className="
            min-w-0
            rounded-3xl
            border
            border-[var(--flascam-border)]
            bg-white
            p-4
            shadow-sm
            sm:p-6
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-extrabold
                text-slate-950
              "
            >
              Ordre d’affichage
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-[var(--flascam-slate)]
              "
            >
              La première image de cette liste sera
              affichée en premier sur la page
              d’accueil.
            </p>
          </div>

          {loading ? (
            <div
              className="
                grid
                min-h-72
                place-items-center
                text-[var(--flascam-blue)]
              "
            >
              <LoaderCircle
                size={30}
                className="animate-spin"
              />
            </div>
          ) : orderedSlides.length ===
            0 ? (
            <div
              className="
                mt-6
                grid
                min-h-64
                place-items-center
                rounded-2xl
                border
                border-dashed
                border-[var(--flascam-border)]
                bg-[#f8fbff]
                px-6
                text-center
              "
            >
              <div>
                <ImagePlus
                  size={34}
                  className="
                    mx-auto
                    text-[var(--flascam-blue)]
                  "
                />

                <p
                  className="
                    mt-3
                    font-extrabold
                    text-slate-900
                  "
                >
                  Aucune image ajoutée
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--flascam-slate)]
                  "
                >
                  Utilisez le formulaire pour créer
                  le premier élément du diaporama.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="
                mt-6
                space-y-4
              "
            >
              {orderedSlides.map(
                (
                  slide,
                  index,
                ) => (
                  <article
                    key={slide.id}
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-[var(--flascam-border)]
                      bg-white
                    "
                  >
                    <div
                      className="
                        grid
                        gap-4
                        p-3
                        sm:grid-cols-[160px_minmax(0,1fr)]
                        sm:p-4
                      "
                    >
                      <div
                        className="
                          relative
                          aspect-[16/10]
                          overflow-hidden
                          rounded-xl
                          bg-slate-100
                        "
                      >
<img
  src={slide.imageUrl}
  alt={slide.altText}
  style={{
    objectPosition:
      `${slide.desktopPositionX}% ${slide.desktopPositionY}%`,
  }}
  className="
    absolute
    inset-0
    size-full
    object-cover
  "
/>

                        <span
                          className="
                            absolute
                            left-2
                            top-2
                            rounded-full
                            bg-[#07355d]/90
                            px-2.5
                            py-1
                            text-xs
                            font-extrabold
                            text-white
                          "
                        >
                          {index + 1}
                        </span>
                      </div>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <div
                          className="
                            flex
                            flex-wrap
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <h3
                              className="
                                truncate
                                font-extrabold
                                text-slate-950
                              "
                            >
                              {slide.title ||
                                `Image ${index + 1}`}
                            </h3>

                            <p
                              className="
                                mt-1
                                line-clamp-2
                                text-sm
                                leading-5
                                text-[var(--flascam-slate)]
                              "
                            >
                              {slide.altText}
                            </p>
                          </div>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-1.5
                              text-xs
                              font-extrabold
                              ${
                                slide.isPublished
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }
                            `}
                          >
                            {slide.isPublished ? (
                              <Eye
                                size={14}
                              />
                            ) : (
                              <EyeOff
                                size={14}
                              />
                            )}

                            {slide.isPublished
                              ? 'Publiée'
                              : 'Masquée'}
                          </span>
                        </div>

                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              moveSlide(
                                slide.id,
                                'up',
                              )
                            }
                            disabled={
                              index === 0 ||
                              movingId !==
                                null
                            }
                            className="
                              grid
                              size-10
                              place-items-center
                              rounded-xl
                              border
                              border-[var(--flascam-border)]
                              text-slate-700
                              transition
                              hover:border-[var(--flascam-blue)]
                              hover:text-[var(--flascam-blue)]
                              disabled:cursor-not-allowed
                              disabled:opacity-35
                            "
                            aria-label="Remonter l’image"
                          >
                            <ArrowUp
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveSlide(
                                slide.id,
                                'down',
                              )
                            }
                            disabled={
                              index ===
                                orderedSlides.length -
                                  1 ||
                              movingId !==
                                null
                            }
                            className="
                              grid
                              size-10
                              place-items-center
                              rounded-xl
                              border
                              border-[var(--flascam-border)]
                              text-slate-700
                              transition
                              hover:border-[var(--flascam-blue)]
                              hover:text-[var(--flascam-blue)]
                              disabled:cursor-not-allowed
                              disabled:opacity-35
                            "
                            aria-label="Descendre l’image"
                          >
                            <ArrowDown
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              togglePublished(
                                slide,
                              )
                            }
                            className="
                              flex
                              h-10
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[var(--flascam-border)]
                              px-3
                              text-xs
                              font-bold
                              text-slate-700
                              transition
                              hover:border-[var(--flascam-blue)]
                              hover:text-[var(--flascam-blue)]
                            "
                          >
                            {slide.isPublished ? (
                              <EyeOff
                                size={16}
                              />
                            ) : (
                              <Eye
                                size={16}
                              />
                            )}

                            {slide.isPublished
                              ? 'Masquer'
                              : 'Publier'}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                slide,
                              )
                            }
                            className="
                              flex
                              h-10
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-[var(--flascam-border)]
                              px-3
                              text-xs
                              font-bold
                              text-slate-700
                              transition
                              hover:border-[var(--flascam-blue)]
                              hover:text-[var(--flascam-blue)]
                            "
                          >
                            <Pencil
                              size={16}
                            />
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              removeSlide(
                                slide,
                              )
                            }
                            disabled={
                              deletingId ===
                              slide.id
                            }
                            className="
                              ml-auto
                              flex
                              h-10
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-red-200
                              px-3
                              text-xs
                              font-bold
                              text-red-700
                              transition
                              hover:bg-red-50
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {deletingId ===
                            slide.id ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}

                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}