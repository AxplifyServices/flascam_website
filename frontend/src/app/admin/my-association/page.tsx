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
  UserRound,
} from 'lucide-react';

import {
  getOwnAssociation,
  updateOwnAssociation,
  uploadAssociationImage,
} from '@/lib/associations-api';

import type {
  AssociationDetail,
  AssociationLeaderRole,
  OwnAssociationFormState,
} from '@/types/associations';

function createEmptyLeaders():
  OwnAssociationFormState['leaders'] {
  return [
    {
      role:
        'PRESIDENT',

      fullName:
        '',

      photoMediaAssetId:
        '',

      photoUrl:
        '',

      biography:
        '',

      message:
        '',

      isPublished:
        true,

      displayOrder:
        '0',
    },

    {
      role:
        'SECRETARY_GENERAL',

      fullName:
        '',

      photoMediaAssetId:
        '',

      photoUrl:
        '',

      biography:
        '',

      message:
        '',

      isPublished:
        true,

      displayOrder:
        '1',
    },
  ];
}

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
  leaders: createEmptyLeaders(),
};

function mapAssociationLeadersToForm(
  association: AssociationDetail,
): OwnAssociationFormState['leaders'] {
  const leaders =
    association.leaders ?? [];

  const president =
    leaders.find(
      (leader) =>
        leader.role ===
        'PRESIDENT',
    );

  const secretaryGeneral =
    leaders.find(
      (leader) =>
        leader.role ===
        'SECRETARY_GENERAL',
    );

  return [
    {
      role:
        'PRESIDENT',

      fullName:
        president?.fullName ?? '',

      photoMediaAssetId:
        president?.photoMediaAssetId ??
        '',

      photoUrl:
        president?.photoUrl ?? '',

      biography:
        president?.biography ?? '',

      message:
        president?.message ?? '',

      isPublished:
        president?.isPublished ?? true,

      displayOrder:
        String(
          president?.displayOrder ?? 0,
        ),
    },

    {
      role:
        'SECRETARY_GENERAL',

      fullName:
        secretaryGeneral?.fullName ??
        '',

      photoMediaAssetId:
        secretaryGeneral
          ?.photoMediaAssetId ?? '',

      photoUrl:
        secretaryGeneral?.photoUrl ??
        '',

      biography:
        secretaryGeneral?.biography ??
        '',

      message:
        '',

      isPublished:
        secretaryGeneral?.isPublished ??
        true,

      displayOrder:
        String(
          secretaryGeneral
            ?.displayOrder ?? 1,
        ),
    },
  ];
}

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
leaders:
  mapAssociationLeadersToForm(
    association,
  ),

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
  uploadingLeaderRole,
  setUploadingLeaderRole,
] =
  useState<AssociationLeaderRole | null>(
    null,
  );  

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

function updateLeaderField(
  role: AssociationLeaderRole,
  field:
    | 'fullName'
    | 'biography'
    | 'message',
  value: string,
) {
  setForm(
    (current) => ({
      ...current,

      leaders:
        current.leaders.map(
          (leader) =>
            leader.role === role
              ? {
                  ...leader,
                  [field]:
                    value,
                }
              : leader,
        ),
    }),
  );

  setError('');
  setSuccess('');
}

function updateLeaderPublished(
  role: AssociationLeaderRole,
  isPublished: boolean,
) {
  setForm(
    (current) => ({
      ...current,

      leaders:
        current.leaders.map(
          (leader) =>
            leader.role === role
              ? {
                  ...leader,
                  isPublished,
                }
              : leader,
        ),
    }),
  );

  setError('');
  setSuccess('');
}

function removeLeaderPhoto(
  role: AssociationLeaderRole,
) {
  setForm(
    (current) => ({
      ...current,

      leaders:
        current.leaders.map(
          (leader) =>
            leader.role === role
              ? {
                  ...leader,

                  photoMediaAssetId:
                    '',

                  photoUrl:
                    '',
                }
              : leader,
        ),
    }),
  );

  setError('');
  setSuccess(
    'La photo sera retirée après l’enregistrement de la fiche.',
  );
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

async function uploadLeaderPhoto(
  role: AssociationLeaderRole,
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
  setUploadingLeaderRole(
    role,
  );

  try {
    const uploaded =
      await uploadAssociationImage(
        file,
      );

    setForm(
      (current) => ({
        ...current,

        leaders:
          current.leaders.map(
            (leader) =>
              leader.role === role
                ? {
                    ...leader,

                    photoMediaAssetId:
                      uploaded.id,

                    photoUrl:
                      uploaded.url,
                  }
                : leader,
          ),
      }),
    );

    setSuccess(
      'La photo a été importée. Enregistrez la fiche pour confirmer la modification.',
    );
  } catch (caughtError) {
    setError(
      caughtError instanceof Error
        ? caughtError.message
        : 'Impossible d’importer la photo du dirigeant.',
    );
  } finally {
    setUploadingLeaderRole(
      null,
    );
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

const president =
  form.leaders.find(
    (leader) =>
      leader.role ===
      'PRESIDENT',
  );

const secretaryGeneral =
  form.leaders.find(
    (leader) =>
      leader.role ===
      'SECRETARY_GENERAL',
  );

if (
  president?.message.trim() &&
  !president.fullName.trim()
) {
  setError(
    'Renseignez le nom du président avant d’ajouter son mot.',
  );

  return;
}

if (
  president?.biography.trim() &&
  !president.fullName.trim()
) {
  setError(
    'Renseignez le nom du président avant d’ajouter sa biographie.',
  );

  return;
}

if (
  secretaryGeneral?.biography.trim() &&
  !secretaryGeneral.fullName.trim()
) {
  setError(
    'Renseignez le nom du secrétaire général avant d’ajouter sa biographie.',
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
  title="Équipe dirigeante"
  description="Présentez le président et le secrétaire général sur la page publique de l’association."
>
  <div
    className="
      grid
      gap-6
      xl:grid-cols-2
    "
  >
    {form.leaders.map(
      (leader) => (
        <LeaderEditor
          key={leader.role}
          role={leader.role}
          fullName={leader.fullName}
          photoUrl={leader.photoUrl}
          biography={leader.biography}
          message={leader.message}
          isPublished={
            leader.isPublished
          }
          uploading={
            uploadingLeaderRole ===
            leader.role
          }
          onFullNameChange={(
            value,
          ) =>
            updateLeaderField(
              leader.role,
              'fullName',
              value,
            )
          }
          onBiographyChange={(
            value,
          ) =>
            updateLeaderField(
              leader.role,
              'biography',
              value,
            )
          }
          onMessageChange={(
            value,
          ) =>
            updateLeaderField(
              leader.role,
              'message',
              value,
            )
          }
          onPublishedChange={(
            value,
          ) =>
            updateLeaderPublished(
              leader.role,
              value,
            )
          }
          onPhotoChange={(
            event,
          ) =>
            uploadLeaderPhoto(
              leader.role,
              event,
            )
          }
          onPhotoRemove={() =>
            removeLeaderPhoto(
              leader.role,
            )
          }
        />
      ),
    )}
  </div>
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
  uploadingCover ||
  uploadingLeaderRole !== null
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

function LeaderEditor({
  role,
  fullName,
  photoUrl,
  biography,
  message,
  isPublished,
  uploading,
  onFullNameChange,
  onBiographyChange,
  onMessageChange,
  onPublishedChange,
  onPhotoChange,
  onPhotoRemove,
}: {
  role: AssociationLeaderRole;
  fullName: string;
  photoUrl: string;
  biography: string;
  message: string;
  isPublished: boolean;
  uploading: boolean;
  onFullNameChange:
    (value: string) => void;
  onBiographyChange:
    (value: string) => void;
  onMessageChange:
    (value: string) => void;
  onPublishedChange:
    (value: boolean) => void;
  onPhotoChange:
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => void;
  onPhotoRemove:
    () => void;
}) {
  const isPresident =
    role === 'PRESIDENT';

  const title =
    isPresident
      ? 'Président'
      : 'Secrétaire général';

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        border
        border-[var(--flascam-border)]
        bg-[#f8fbfd]
      "
    >
      <header
        className="
          flex
          flex-col
          gap-4
          border-b
          border-[var(--flascam-border)]
          bg-white
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <span
            className="
              grid
              size-11
              place-items-center
              rounded-2xl
              bg-[#eaf4fb]
              text-[var(--flascam-blue)]
            "
          >
            <UserRound
              size={20}
            />
          </span>

          <div>
            <h3
              className="
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
              {isPresident
                ? 'Présentation et mot institutionnel'
                : 'Présentation institutionnelle'}
            </p>
          </div>
        </div>

        <label
          className="
            inline-flex
            cursor-pointer
            items-center
            gap-3
            text-sm
            font-bold
            text-slate-700
          "
        >
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) =>
              onPublishedChange(
                event.target.checked,
              )
            }
            className="
              size-4
              accent-[var(--flascam-blue)]
            "
          />

          Afficher publiquement
        </label>
      </header>

      <div
        className="
          space-y-5
          p-5
          sm:p-6
        "
      >
        <div
          className="
            grid
            gap-5
            sm:grid-cols-[9rem_1fr]
          "
        >
          <div>
            <div
              className="
                grid
                aspect-[4/5]
                w-full
                place-items-center
                overflow-hidden
                rounded-2xl
                border
                border-[var(--flascam-border)]
                bg-white
              "
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={
                    fullName
                      ? `Photo de ${fullName}`
                      : `Photo du ${title.toLowerCase()}`
                  }
                  className="
                    h-full
                    w-full
                    object-cover
                    object-center
                  "
                />
              ) : (
                <UserRound
                  size={42}
                  className="
                    text-slate-300
                  "
                />
              )}
            </div>

            <label
              className={`
                mt-3
                inline-flex
                min-h-10
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[var(--flascam-border)]
                bg-white
                px-3
                text-xs
                font-bold
                text-slate-700
                transition
                hover:border-[var(--flascam-blue)]
                hover:text-[var(--flascam-blue)]
                ${
                  uploading
                    ? 'pointer-events-none opacity-60'
                    : ''
                }
              `}
            >
              {uploading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Upload
                  size={15}
                />
              )}

              Importer

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={
                  onPhotoChange
                }
              />
            </label>

            {photoUrl && (
              <button
                type="button"
                onClick={
                  onPhotoRemove
                }
                className="
                  mt-2
                  min-h-9
                  w-full
                  rounded-xl
                  px-3
                  text-xs
                  font-bold
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                Retirer la photo
              </button>
            )}
          </div>

          <TextField
            label="Nom complet"
            value={fullName}
            maxLength={180}
            onChange={
              onFullNameChange
            }
          />
        </div>

        <TextareaField
          label="Biographie"
          value={biography}
          rows={6}
          maxLength={10_000}
          onChange={
            onBiographyChange
          }
        />

        {isPresident && (
          <TextareaField
            label="Mot du président"
            value={message}
            rows={8}
            maxLength={10_000}
            onChange={
              onMessageChange
            }
          />
        )}

        <p
          className="
            text-xs
            leading-5
            text-[var(--flascam-slate)]
          "
        >
          Formats acceptés : JPG, PNG ou WebP.
          Pour un meilleur rendu, utilisez une photo
          verticale nette, idéalement au format 4:5.
        </p>
      </div>
    </article>
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