'use client';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Building2,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Loader2,
  LockKeyhole,
  Save,
  Upload,
} from 'lucide-react';

import {
  getOwnAssociation,
  updateOwnAssociation,
  uploadAssociationImage,
} from '@/lib/associations-api';

import type {
  AssociationDetail,
  OwnAssociationFormState,
} from '@/types/associations';

const emptyForm: OwnAssociationFormState = {
  name: '',
  acronym: '',
  region: '',
  city: '',
  memberCount: '',
  logoMediaAssetId: '',
  coverImageUrl: '',
  logoText: '',
  presentation: '',
  address: '',
  phone: '',
  email: '',
  websiteUrl: '',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  seoTitle: '',
  seoDescription: '',
};

function mapAssociationToForm(
  association: AssociationDetail,
): OwnAssociationFormState {
  return {
    name:
      association.name ?? '',
    acronym:
      association.acronym ?? '',
    region:
      association.region ?? '',
    city:
      association.city ?? '',
    memberCount:
      association.memberCount === null ||
      association.memberCount === undefined
        ? ''
        : String(
            association.memberCount,
          ),
    logoMediaAssetId:
      association.logoMediaAssetId ?? '',
    coverImageUrl:
      association.coverImageUrl ?? '',
    logoText:
      association.logoText ?? '',
    presentation:
      association.presentation ?? '',
    address:
      association.address ?? '',
    phone:
      association.phone ?? '',
    email:
      association.email ?? '',
    websiteUrl:
      association.websiteUrl ?? '',
    facebookUrl:
      association.facebookUrl ?? '',
    instagramUrl:
      association.instagramUrl ?? '',
    linkedinUrl:
      association.linkedinUrl ?? '',
    youtubeUrl:
      association.youtubeUrl ?? '',
    seoTitle:
      association.seoTitle ?? '',
    seoDescription:
      association.seoDescription ?? '',
  };
}

export default function MyAssociationPage() {
  const [
    association,
    setAssociation,
  ] = useState<AssociationDetail | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = useState<OwnAssociationFormState>(
    emptyForm,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingLogo,
    setUploadingLogo,
  ] = useState(false);

  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false);

  const [
    logoPreview,
    setLogoPreview,
  ] = useState('');

  const [
    coverPreview,
    setCoverPreview,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  useEffect(() => {
    let active = true;

    async function loadAssociation() {
      try {
        const data =
          await getOwnAssociation();

        if (!active) {
          return;
        }

        setAssociation(data);
        setForm(
          mapAssociationToForm(data),
        );
        setLogoPreview(
          data.logoUrl ?? '',
        );
        setCoverPreview(
          data.coverImageUrl ?? '',
        );
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Impossible de charger votre association.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadAssociation();

    return () => {
      active = false;
    };
  }, []);

  function updateField(
    field: keyof OwnAssociationFormState,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError('');
    setSuccess('');
  }

  async function uploadLogo(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');
    setUploadingLogo(true);

    try {
      const uploaded =
        await uploadAssociationImage(
          file,
        );

      setForm(
        (current) => ({
          ...current,
          logoMediaAssetId:
            uploaded.id,
        }),
      );

      setLogoPreview(
        uploaded.url,
      );

      setSuccess(
        'Le logo a été importé. Enregistrez la fiche pour confirmer la modification.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible d’importer le logo.',
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function uploadCover(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    setError('');
    setSuccess('');
    setUploadingCover(true);

    try {
      const uploaded =
        await uploadAssociationImage(
          file,
        );

      setForm(
        (current) => ({
          ...current,
          coverImageUrl:
            uploaded.url,
        }),
      );

      setCoverPreview(
        uploaded.url,
      );

      setSuccess(
        'La bannière a été importée. Enregistrez la fiche pour confirmer la modification.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible d’importer la bannière.',
      );
    } finally {
      setUploadingCover(false);
    }
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError(
        'Le nom de l’association est obligatoire.',
      );
      return;
    }

    if (!form.region.trim()) {
      setError(
        'La région est obligatoire.',
      );
      return;
    }

    setSaving(true);

    try {
      const updated =
        await updateOwnAssociation(
          form,
        );

      setAssociation(updated);
      setForm(
        mapAssociationToForm(
          updated,
        ),
      );
      setLogoPreview(
        updated.logoUrl ?? '',
      );
      setCoverPreview(
        updated.coverImageUrl ?? '',
      );

      setSuccess(
        'Les informations ont été enregistrées.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible d’enregistrer les modifications.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
          grid
          min-h-[55vh]
          place-items-center
        "
      >
        <Loader2
          className="
            animate-spin
            text-[var(--flascam-blue)]
          "
          size={30}
        />
      </div>
    );
  }

  if (!association) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-6
          text-red-700
        "
      >
        {error ||
          'Aucune association n’est liée à ce compte.'}
      </div>
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
          <Building2 size={16} />
          Espace association
        </p>

        <div
          className="
            mt-3
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-extrabold
                tracking-[-0.04em]
                text-[var(--flascam-black)]
                sm:text-4xl
              "
            >
              Ma fiche
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
              Modifiez les informations publiques de
              votre association. Les modifications sont
              publiées sans nouvelle validation.
            </p>
          </div>

          <a
            href={`/associations/${association.slug}`}
            target="_blank"
            rel="noreferrer"
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[var(--flascam-border)]
              bg-white
              px-4
              text-sm
              font-bold
              text-slate-700
            "
          >
            Voir la page publique
            <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {error && (
        <div
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
          className="
            mt-5
            flex
            items-center
            gap-2
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
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <form
        onSubmit={submit}
        className="
          mt-6
          space-y-6
        "
      >
        <FormSection
          title="Images principales"
          description="Importez le logo et la bannière publique de votre association."
        >
          <div
            className="
              grid
              gap-6
              lg:grid-cols-2
            "
          >
            <ImageField
              title="Logo"
              description="Une image carrée est recommandée."
              previewUrl={logoPreview}
              loading={uploadingLogo}
              onChange={uploadLogo}
            />

            <ImageField
              title="Bannière"
              description="Une image horizontale est recommandée."
              previewUrl={coverPreview}
              loading={uploadingCover}
              onChange={uploadCover}
              wide
            />
          </div>
        </FormSection>

        <FormSection
          title="Informations générales"
          description="Ces informations apparaissent sur la page publique."
        >
          <FieldGrid>
            <TextField
              label="Nom de l’association"
              value={form.name}
              required
              onChange={(value) =>
                updateField(
                  'name',
                  value,
                )
              }
            />

            <TextField
              label="Sigle"
              value={form.acronym}
              onChange={(value) =>
                updateField(
                  'acronym',
                  value,
                )
              }
            />

            <TextField
              label="Région"
              value={form.region}
              required
              onChange={(value) =>
                updateField(
                  'region',
                  value,
                )
              }
            />

            <TextField
              label="Ville"
              value={form.city}
              onChange={(value) =>
                updateField(
                  'city',
                  value,
                )
              }
            />

            <TextField
              label="Nombre d’adhérents"
              value={form.memberCount}
              type="number"
              onChange={(value) =>
                updateField(
                  'memberCount',
                  value,
                )
              }
            />

            <TextField
              label="Initiales du logo"
              value={form.logoText}
              maxLength={12}
              onChange={(value) =>
                updateField(
                  'logoText',
                  value,
                )
              }
            />
          </FieldGrid>

          <TextareaField
            label="Présentation"
            value={form.presentation}
            rows={7}
            onChange={(value) =>
              updateField(
                'presentation',
                value,
              )
            }
          />
        </FormSection>

        <FormSection
          title="Coordonnées"
          description="Informations publiques permettant de contacter l’association."
        >
          <FieldGrid>
            <TextField
              label="Adresse"
              value={form.address}
              onChange={(value) =>
                updateField(
                  'address',
                  value,
                )
              }
            />

            <TextField
              label="Téléphone"
              value={form.phone}
              type="tel"
              onChange={(value) =>
                updateField(
                  'phone',
                  value,
                )
              }
            />

            <TextField
              label="E-mail public"
              value={form.email}
              type="email"
              onChange={(value) =>
                updateField(
                  'email',
                  value,
                )
              }
            />

            <TextField
              label="Site internet"
              value={form.websiteUrl}
              placeholder="https://..."
              onChange={(value) =>
                updateField(
                  'websiteUrl',
                  value,
                )
              }
            />
          </FieldGrid>
        </FormSection>

        <FormSection
          title="Réseaux sociaux"
          description="Laissez les champs inutilisés vides."
        >
          <FieldGrid>
            <TextField
              label="Facebook"
              value={form.facebookUrl}
              placeholder="https://..."
              onChange={(value) =>
                updateField(
                  'facebookUrl',
                  value,
                )
              }
            />

            <TextField
              label="Instagram"
              value={form.instagramUrl}
              placeholder="https://..."
              onChange={(value) =>
                updateField(
                  'instagramUrl',
                  value,
                )
              }
            />

            <TextField
              label="LinkedIn"
              value={form.linkedinUrl}
              placeholder="https://..."
              onChange={(value) =>
                updateField(
                  'linkedinUrl',
                  value,
                )
              }
            />

            <TextField
              label="YouTube"
              value={form.youtubeUrl}
              placeholder="https://..."
              onChange={(value) =>
                updateField(
                  'youtubeUrl',
                  value,
                )
              }
            />
          </FieldGrid>
        </FormSection>

        <FormSection
          title="Référencement"
          description="Ces données améliorent l’affichage de la page dans les moteurs de recherche."
        >
          <TextField
            label="Titre SEO"
            value={form.seoTitle}
            maxLength={255}
            onChange={(value) =>
              updateField(
                'seoTitle',
                value,
              )
            }
          />

          <TextareaField
            label="Description SEO"
            value={form.seoDescription}
            rows={4}
            maxLength={320}
            onChange={(value) =>
              updateField(
                'seoDescription',
                value,
              )
            }
          />
        </FormSection>

        <section
          className="
            rounded-3xl
            border
            border-amber-200
            bg-amber-50
            p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <LockKeyhole
              className="
                mt-0.5
                shrink-0
                text-amber-700
              "
              size={20}
            />

            <div>
              <h2
                className="
                  font-extrabold
                  text-amber-950
                "
              >
                Informations réservées à FLASCAM
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-amber-800
                "
              >
                L’année d’affiliation, le statut de
                publication, l’ordre d’affichage, le
                slug, les identifiants et le mot de passe
                ne peuvent être modifiés que par
                l’administration FLASCAM.
              </p>
            </div>
          </div>
        </section>

        <div
          className="
            sticky
            bottom-4
            z-10
            flex
            justify-end
          "
        >
          <button
            type="submit"
            disabled={
              saving ||
              uploadingLogo ||
              uploadingCover
            }
            className="
              flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[var(--flascam-blue)]
              px-6
              text-sm
              font-extrabold
              text-white
              shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            {saving ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Save size={19} />
            )}

            {saving
              ? 'Enregistrement…'
              : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-[var(--flascam-border)]
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <h2
        className="
          text-xl
          font-extrabold
          text-slate-950
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-1
          text-sm
          text-[var(--flascam-slate)]
        "
      >
        {description}
      </p>

      <div
        className="
          mt-5
          space-y-5
        "
      >
        {children}
      </div>
    </section>
  );
}

function FieldGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        gap-5
        md:grid-cols-2
      "
    >
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span
        className="
          text-sm
          font-bold
          text-slate-800
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        min={
          type === 'number'
            ? 0
            : undefined
        }
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
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
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows,
  maxLength,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  rows: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span
        className="
          text-sm
          font-bold
          text-slate-800
        "
      >
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="
          mt-2
          w-full
          resize-y
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
    </label>
  );
}

function ImageField({
  title,
  description,
  previewUrl,
  loading,
  onChange,
  wide = false,
}: {
  title: string;
  description: string;
  previewUrl: string;
  loading: boolean;
  onChange:
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => void;
  wide?: boolean;
}) {
  return (
    <div>
      <div
        className={`
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[var(--flascam-border)]
          bg-slate-100
          ${
            wide
              ? 'aspect-[16/7]'
              : 'aspect-square max-w-56'
          }
        `}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`Aperçu ${title}`}
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
              text-center
            "
          >
            <ImagePlus
              size={30}
              className="
                mx-auto
                text-[var(--flascam-blue)]
              "
            />

            <p
              className="
                mt-2
                text-sm
                font-bold
                text-slate-700
              "
            >
              Aucune image
            </p>
          </div>
        )}

        {loading && (
          <div
            className="
              absolute
              inset-0
              grid
              place-items-center
              bg-white/80
            "
          >
            <Loader2
              size={28}
              className="
                animate-spin
                text-[var(--flascam-blue)]
              "
            />
          </div>
        )}
      </div>

      <h3
        className="
          mt-3
          text-sm
          font-extrabold
          text-slate-950
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-xs
          text-[var(--flascam-slate)]
        "
      >
        {description}
      </p>

      <label
        className="
          mt-3
          inline-flex
          min-h-11
          cursor-pointer
          items-center
          gap-2
          rounded-xl
          border
          border-[var(--flascam-border)]
          bg-white
          px-4
          text-sm
          font-bold
          text-slate-700
        "
      >
        <Upload size={17} />

        {previewUrl
          ? 'Remplacer'
          : 'Importer'}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={onChange}
          disabled={loading}
          className="sr-only"
        />
      </label>
    </div>
  );
}