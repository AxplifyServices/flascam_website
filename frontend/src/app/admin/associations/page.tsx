'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Save,
  UsersRound,
} from 'lucide-react';

import {
  createAdminAssociation,
  getAdminAssociations,
  updateAdminAssociation,
  updateAdminAssociationStatus,
} from '@/lib/associations-api';

import type {
  AssociationFormState,
  AssociationSummary,
} from '@/types/associations';

const emptyForm: AssociationFormState = {
  name: '',
  slug: '',
  acronym: '',
  region: '',
  city: '',
  memberCount: '',
  affiliatedSinceYear: '',
  logoMediaAssetId: '',
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
  isFeatured: false,
  displayOrder: '0',
  seoTitle: '',
  seoDescription: '',
};

const statusLabels: Record<
  string,
  string
> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'En validation',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formFromAssociation(
  association: AssociationSummary,
): AssociationFormState {
  return {
    ...emptyForm,
    name: association.name ?? '',
    slug: association.slug ?? '',
    acronym: association.acronym ?? '',
    region: association.region ?? '',
    city: association.city ?? '',
    memberCount:
      association.memberCount === null ||
      association.memberCount === undefined
        ? ''
        : String(
            association.memberCount,
          ),
    affiliatedSinceYear:
      association.affiliatedSinceYear
        ? String(
            association.affiliatedSinceYear,
          )
        : '',
    logoText:
      association.logoText ?? '',
    isFeatured:
      association.isFeatured ?? false,
    displayOrder:
      association.displayOrder === null ||
      association.displayOrder === undefined
        ? '0'
        : String(
            association.displayOrder,
          ),
    seoTitle:
      association.seoTitle ?? '',
    seoDescription:
      association.seoDescription ?? '',
  };
}

export default function AdminAssociationsPage() {
  const [
    associations,
    setAssociations,
  ] = useState<
    AssociationSummary[]
  >([]);

  const [
    selected,
    setSelected,
  ] = useState<
    AssociationSummary | null
  >(null);

  const [
    form,
    setForm,
  ] = useState<AssociationFormState>(
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
    error,
    setError,
  ] = useState('');

  const [
    success,
    setSuccess,
  ] = useState('');

  const [
    query,
    setQuery,
  ] = useState('');

  const filtered =
    useMemo(() => {
      const search =
        query.trim().toLowerCase();

      if (!search) {
        return associations;
      }

      return associations.filter(
        (association) =>
          [
            association.name,
            association.region,
            association.city,
            association.status,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(search),
      );
    }, [
      associations,
      query,
    ]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const data =
        await getAdminAssociations();

      setAssociations(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de charger les associations.',
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field:
      keyof AssociationFormState,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'name' &&
      !selected
        ? {
            slug:
              slugify(
                String(value),
              ),
            logoText:
              String(value)
                .slice(0, 2)
                .toUpperCase(),
          }
        : {}),
    }));
  }

  function startCreate() {
    setSelected(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  }

  function startEdit(
    association:
      AssociationSummary,
  ) {
    setSelected(association);
    setForm(
      formFromAssociation(
        association,
      ),
    );
    setError('');
    setSuccess('');
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated =
        selected
          ? await updateAdminAssociation(
              selected.id,
              form,
            )
          : await createAdminAssociation(
              form,
            );

      setSuccess(
        selected
          ? 'Association modifiée.'
          : 'Association créée.',
      );

      setSelected(updated);
      setForm(
        formFromAssociation(
          updated,
        ),
      );

      await load();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Enregistrement impossible.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    status:
      | 'DRAFT'
      | 'SUBMITTED'
      | 'PUBLISHED'
      | 'ARCHIVED',
  ) {
    if (!selected) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateAdminAssociationStatus(
        selected.id,
        status,
      );

      setSuccess(
        `Statut mis à jour : ${statusLabels[status]}.`,
      );

      await load();

      setSelected((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Changement de statut impossible.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl">
      <header className="rounded-[2rem] border border-[var(--flascam-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--flascam-blue)]">
              <Building2 size={16} />
              Associations régionales
            </p>

            <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Gestion des associations
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--flascam-slate)]">
              Créez les associations régionales, préparez leurs pages publiques
              et publiez uniquement les fiches validées.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--flascam-blue)] px-5 text-sm font-bold text-white transition hover:bg-[var(--flascam-blue-dark)]"
          >
            <Plus size={18} />
            Nouvelle association
          </button>
        </div>
      </header>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {success}
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_1fr]">
        <aside className="rounded-[1.5rem] border border-[var(--flascam-border)] bg-white p-4 shadow-sm">
          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Rechercher une association..."
            className="h-11 w-full rounded-xl border border-[var(--flascam-border)] px-4 text-sm outline-none focus:border-[var(--flascam-blue)]"
          />

          {loading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-[var(--flascam-slate)]">
                  Aucune association trouvée.
                </p>
              ) : (
                filtered.map(
                  (association) => (
                    <button
                      key={association.id}
                      type="button"
                      onClick={() =>
                        startEdit(
                          association,
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selected?.id ===
                        association.id
                          ? 'border-[var(--flascam-blue)] bg-[#eaf5ff]'
                          : 'border-[var(--flascam-border)] bg-white hover:border-[var(--flascam-blue)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-sm font-extrabold leading-snug text-slate-950">
                          {association.name}
                        </h2>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[0.62rem] font-extrabold uppercase text-slate-600">
                          {
                            statusLabels[
                              association.status ??
                                'DRAFT'
                            ] ??
                            association.status
                          }
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-2 text-xs text-[var(--flascam-slate)]">
                        <MapPin size={14} />
                        {association.city
                          ? `${association.city} · ${association.region}`
                          : association.region}
                      </p>
                    </button>
                  ),
                )
              )}
            </div>
          )}
        </aside>

        <section className="rounded-[1.5rem] border border-[var(--flascam-border)] bg-white p-5 shadow-sm sm:p-6">
          <form
            onSubmit={submit}
            className="space-y-8"
          >
            <div className="flex flex-col gap-4 border-b border-[var(--flascam-border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  {selected
                    ? 'Modifier l’association'
                    : 'Créer une association'}
                </h2>

                <p className="mt-1 text-sm text-[var(--flascam-slate)]">
                  Les champs publics alimentent directement la page association.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected?.slug && (
                  <Link
                    href={`/associations/${selected.slug}`}
                    target="_blank"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--flascam-border)] px-4 text-sm font-bold text-slate-700 hover:border-[var(--flascam-blue)] hover:text-[var(--flascam-blue)]"
                  >
                    <Eye size={16} />
                    Voir
                  </Link>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--flascam-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--flascam-blue-dark)] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}
                  Enregistrer
                </button>
              </div>
            </div>

            {selected && (
              <div className="rounded-2xl bg-[#f8fbff] p-4">
                <p className="text-sm font-bold text-slate-950">
                  Statut actuel :{' '}
                  {
                    statusLabels[
                      selected.status ??
                        'DRAFT'
                    ] ??
                    selected.status
                  }
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusButton
                    label="Brouillon"
                    onClick={() =>
                      changeStatus(
                        'DRAFT',
                      )
                    }
                  />

                  <StatusButton
                    label="En validation"
                    onClick={() =>
                      changeStatus(
                        'SUBMITTED',
                      )
                    }
                  />

                  <StatusButton
                    label="Publier"
                    icon={
                      <CheckCircle2
                        size={15}
                      />
                    }
                    onClick={() =>
                      changeStatus(
                        'PUBLISHED',
                      )
                    }
                  />

                  <StatusButton
                    label="Archiver"
                    onClick={() =>
                      changeStatus(
                        'ARCHIVED',
                      )
                    }
                  />
                </div>
              </div>
            )}

            <FormSection title="Identité">
              <div className="grid gap-5 lg:grid-cols-2">
                <AdminInput
                  label="Nom de l’association"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      'name',
                      value,
                    )
                  }
                  required
                />

                <AdminInput
                  label="Slug URL"
                  value={form.slug}
                  onChange={(value) =>
                    updateField(
                      'slug',
                      slugify(value),
                    )
                  }
                  required
                />

                <AdminInput
                  label="Acronyme"
                  value={form.acronym}
                  onChange={(value) =>
                    updateField(
                      'acronym',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Texte logo si pas d’image"
                  value={form.logoText}
                  onChange={(value) =>
                    updateField(
                      'logoText',
                      value,
                    )
                  }
                  maxLength={12}
                />

                <AdminInput
                  label="Région"
                  value={form.region}
                  onChange={(value) =>
                    updateField(
                      'region',
                      value,
                    )
                  }
                  required
                />

                <AdminInput
                  label="Ville"
                  value={form.city}
                  onChange={(value) =>
                    updateField(
                      'city',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Nombre de loueurs membres"
                  type="number"
                  value={form.memberCount}
                  onChange={(value) =>
                    updateField(
                      'memberCount',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Année d’affiliation"
                  type="number"
                  value={form.affiliatedSinceYear}
                  onChange={(value) =>
                    updateField(
                      'affiliatedSinceYear',
                      value,
                    )
                  }
                />
              </div>

              <AdminTextarea
                label="Présentation"
                value={form.presentation}
                onChange={(value) =>
                  updateField(
                    'presentation',
                    value,
                  )
                }
              />
            </FormSection>

            <FormSection title="Coordonnées">
              <div className="grid gap-5 lg:grid-cols-2">
                <AdminInput
                  label="Adresse"
                  value={form.address}
                  onChange={(value) =>
                    updateField(
                      'address',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Téléphone"
                  value={form.phone}
                  onChange={(value) =>
                    updateField(
                      'phone',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField(
                      'email',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Site web"
                  value={form.websiteUrl}
                  onChange={(value) =>
                    updateField(
                      'websiteUrl',
                      value,
                    )
                  }
                />
              </div>
            </FormSection>

            <FormSection title="Réseaux sociaux">
              <div className="grid gap-5 lg:grid-cols-2">
                <AdminInput
                  label="Facebook"
                  value={form.facebookUrl}
                  onChange={(value) =>
                    updateField(
                      'facebookUrl',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="Instagram"
                  value={form.instagramUrl}
                  onChange={(value) =>
                    updateField(
                      'instagramUrl',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="LinkedIn"
                  value={form.linkedinUrl}
                  onChange={(value) =>
                    updateField(
                      'linkedinUrl',
                      value,
                    )
                  }
                />

                <AdminInput
                  label="YouTube"
                  value={form.youtubeUrl}
                  onChange={(value) =>
                    updateField(
                      'youtubeUrl',
                      value,
                    )
                  }
                />
              </div>
            </FormSection>

            <FormSection title="Médias et affichage">
              <div className="grid gap-5 lg:grid-cols-2">
                <AdminInput
                  label="ID média du logo"
                  value={form.logoMediaAssetId}
                  onChange={(value) =>
                    updateField(
                      'logoMediaAssetId',
                      value,
                    )
                  }
                  helper="Temporaire : sera remplacé par l’upload direct MinIO dans l’étape suivante."
                />

                <AdminInput
                  label="Ordre d’affichage"
                  type="number"
                  value={form.displayOrder}
                  onChange={(value) =>
                    updateField(
                      'displayOrder',
                      value,
                    )
                  }
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[var(--flascam-border)] p-4 text-sm font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateField(
                      'isFeatured',
                      event.target.checked,
                    )
                  }
                />
                Afficher cette association sur la page d’accueil
              </label>
            </FormSection>

            <FormSection title="SEO">
              <AdminInput
                label="Titre SEO"
                value={form.seoTitle}
                onChange={(value) =>
                  updateField(
                    'seoTitle',
                    value,
                  )
                }
              />

              <AdminTextarea
                label="Description SEO"
                value={form.seoDescription}
                onChange={(value) =>
                  updateField(
                    'seoDescription',
                    value,
                  )
                }
              />
            </FormSection>
          </form>

          {selected && (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--flascam-border)] bg-[var(--ivory)] p-5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
                <Edit3 size={18} />
                Contenus de l’association
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--flascam-slate)]">
                La fiche de base est prête. L’étape suivante ajoute dans cette zone
                la gestion des actualités, événements, galerie photo et vidéos.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatusButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[var(--flascam-border)] bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[var(--flascam-blue)] hover:text-[var(--flascam-blue)]"
    >
      {icon}
      {label}
    </button>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h3 className="border-b border-[var(--flascam-border)] pb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--flascam-blue)]">
        {title}
      </h3>

      {children}
    </section>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">
        {label}
      </span>

      <input
        type={type}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-[var(--flascam-border)] px-4 text-sm outline-none transition focus:border-[var(--flascam-blue)]"
      />

      {helper && (
        <span className="mt-1 block text-xs leading-5 text-[var(--flascam-slate)]">
          {helper}
        </span>
      )}
    </label>
  );
}

function AdminTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 min-h-32 w-full rounded-xl border border-[var(--flascam-border)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--flascam-blue)]"
      />
    </label>
  );
}