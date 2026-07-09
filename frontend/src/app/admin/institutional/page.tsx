'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  Loader2,
  Save,
} from 'lucide-react';

import {
  apiFetch,
} from '@/lib/api';

import type {
  InstitutionalContent,
} from '@/types/institutional';

export default function InstitutionalAdminPage() {
  const router = useRouter();

  const [
    content,
    setContent,
  ] = useState<
    InstitutionalContent | null
  >(null);

  const [
    collections,
    setCollections,
  ] = useState({
    missions: '',
    keyFigures: '',
    executiveMembers: '',
    partners: '',
    documents: '',
  });

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

  useEffect(() => {
    let active = true;

    async function load() {
      let response =
        await apiFetch(
          '/institutional/admin',
          {
            cache: 'no-store',
          },
        );

      if (
        response.status === 401
      ) {
        await apiFetch(
          '/auth/refresh',
          {
            method: 'POST',
          },
        );

        response =
          await apiFetch(
            '/institutional/admin',
            {
              cache: 'no-store',
            },
          );
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        router.replace(
          '/admin/login',
        );

        return;
      }

      if (!response.ok) {
        setError(
          'Impossible de charger les contenus.',
        );
        setLoading(false);
        return;
      }

      const data =
        await response.json() as
          InstitutionalContent;

      if (!active) {
        return;
      }

      setContent(data);

      setCollections({
        missions:
          JSON.stringify(
            data.missions,
            null,
            2,
          ),
        keyFigures:
          JSON.stringify(
            data.keyFigures,
            null,
            2,
          ),
        executiveMembers:
          JSON.stringify(
            data.executiveMembers,
            null,
            2,
          ),
        partners:
          JSON.stringify(
            data.partners,
            null,
            2,
          ),
        documents:
          JSON.stringify(
            data.documents,
            null,
            2,
          ),
      });

      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [router]);

  function update(
    field:
      keyof InstitutionalContent,
    value: string | boolean,
  ) {
    setContent((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!content) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...content,

        missions:
          JSON.parse(
            collections.missions,
          ),

        keyFigures:
          JSON.parse(
            collections.keyFigures,
          ),

        executiveMembers:
          JSON.parse(
            collections.executiveMembers,
          ),

        partners:
          JSON.parse(
            collections.partners,
          ),

        documents:
          JSON.parse(
            collections.documents,
          ),
      };

      const response =
        await apiFetch(
          '/institutional/admin',
          {
            method: 'PUT',
            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      if (!response.ok) {
        const body =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          Array.isArray(
            body?.message,
          )
            ? body.message.join(
                ' ',
              )
            : body?.message ??
                'Enregistrement impossible.',
        );
      }

      const updated =
        await response.json() as
          InstitutionalContent;

      setContent(updated);

      setCollections({
        missions:
          JSON.stringify(
            updated.missions,
            null,
            2,
          ),
        keyFigures:
          JSON.stringify(
            updated.keyFigures,
            null,
            2,
          ),
        executiveMembers:
          JSON.stringify(
            updated.executiveMembers,
            null,
            2,
          ),
        partners:
          JSON.stringify(
            updated.partners,
            null,
            2,
          ),
        documents:
          JSON.stringify(
            updated.documents,
            null,
            2,
          ),
      });

      setSuccess(
        'Les contenus institutionnels ont été enregistrés.',
      );
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

  if (loading) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-slate-100
        "
      >
        <Loader2
          className="animate-spin"
        />
      </main>
    );
  }

  if (!content) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-100
          p-6
        "
      >
        {error}
      </main>
    );
  }

  return (
<main>
      <form
        onSubmit={submit}
        className="
          mx-auto
          max-w-6xl
        "
      >
        <header
          className="
            sticky
            top-4
            z-20
            flex
            flex-col
            gap-4
            rounded-2xl
            bg-white
            p-5
            shadow-sm
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>


<h1
  className="
    text-2xl
    font-extrabold
    text-slate-950
  "
>
  Portail public
</h1>
          </div>

          <button
            type="submit"
            disabled={saving}
className="
  inline-flex
  h-11
  items-center
  justify-center
  gap-2
  rounded-xl
  bg-[var(--flascam-blue)]
  px-5
  font-semibold
  text-white
  transition
  hover:bg-[var(--flascam-blue-dark)]
  disabled:opacity-60
"
          >
            {saving ? (
              <Loader2
                size={18}
                className=
                  "animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            Enregistrer
          </button>
        </header>

        {error && (
          <p
            className="
              mt-5
              rounded-xl
              bg-red-50
              p-4
              text-red-800
            "
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="
              mt-5
              rounded-xl
              bg-emerald-50
              p-4
              text-emerald-800
            "
          >
            {success}
          </p>
        )}

        <section className="admin-section">
          <h2 className="admin-title">
            Publication et SEO
          </h2>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={
                content.isPublished
              }
              onChange={(event) =>
                update(
                  'isPublished',
                  event.target.checked,
                )
              }
            />

            Portail publié
          </label>

          <AdminField
            label="Titre SEO"
            value={
              content.seoTitle ?? ''
            }
            onChange={(value) =>
              update(
                'seoTitle',
                value,
              )
            }
          />

          <AdminTextarea
            label="Description SEO"
            value={
              content.seoDescription ??
              ''
            }
            onChange={(value) =>
              update(
                'seoDescription',
                value,
              )
            }
          />
        </section>

        <section className="admin-section">
          <h2 className="admin-title">
            En-tête principal
          </h2>

          <AdminField
            label="Surtitre"
            value={
              content.heroEyebrow ??
              ''
            }
            onChange={(value) =>
              update(
                'heroEyebrow',
                value,
              )
            }
          />

          <AdminField
            label="Titre principal"
            value={
              content.heroTitle
            }
            onChange={(value) =>
              update(
                'heroTitle',
                value,
              )
            }
          />

          <AdminTextarea
            label="Introduction"
            value={
              content.heroSubtitle ??
              ''
            }
            onChange={(value) =>
              update(
                'heroSubtitle',
                value,
              )
            }
          />

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <AdminField
              label="Libellé bouton principal"
              value={
                content
                  .heroPrimaryCtaLabel ??
                ''
              }
              onChange={(value) =>
                update(
                  'heroPrimaryCtaLabel',
                  value,
                )
              }
            />

            <AdminField
              label="URL bouton principal"
              value={
                content
                  .heroPrimaryCtaUrl ??
                ''
              }
              onChange={(value) =>
                update(
                  'heroPrimaryCtaUrl',
                  value,
                )
              }
            />
          </div>
        </section>

        {[
          {
            title:
              'Présentation de la fédération',
            eyebrow:
              'federationEyebrow',
            heading:
              'federationTitle',
            body:
              'federationBody',
          },
          {
            title: 'Missions',
            eyebrow:
              'missionsEyebrow',
            heading:
              'missionsTitle',
            body:
              'missionsBody',
          },
          {
            title: 'Gouvernance',
            eyebrow:
              'governanceEyebrow',
            heading:
              'governanceTitle',
            body:
              'governanceBody',
          },
          {
            title:
              'Bureau exécutif',
            eyebrow:
              'executiveOfficeEyebrow',
            heading:
              'executiveOfficeTitle',
            body:
              'executiveOfficeBody',
          },
          {
            title: 'Partenaires',
            eyebrow:
              'partnersEyebrow',
            heading:
              'partnersTitle',
            body:
              'partnersBody',
          },
          {
            title:
              'Documents institutionnels',
            eyebrow:
              'documentsEyebrow',
            heading:
              'documentsTitle',
            body:
              'documentsBody',
          },
          {
            title: 'Contact',
            eyebrow:
              'contactEyebrow',
            heading:
              'contactTitle',
            body:
              'contactBody',
          },
        ].map((section) => (
          <section
            key={section.title}
            className="admin-section"
          >
            <h2 className="admin-title">
              {section.title}
            </h2>

            <AdminField
              label="Surtitre"
              value={
                String(
                  content[
                    section.eyebrow as
                      keyof InstitutionalContent
                  ] ?? '',
                )
              }
              onChange={(value) =>
                update(
                  section.eyebrow as
                    keyof InstitutionalContent,
                  value,
                )
              }
            />

            <AdminField
              label="Titre"
              value={
                String(
                  content[
                    section.heading as
                      keyof InstitutionalContent
                  ] ?? '',
                )
              }
              onChange={(value) =>
                update(
                  section.heading as
                    keyof InstitutionalContent,
                  value,
                )
              }
            />

            <AdminTextarea
              label="Texte"
              value={
                String(
                  content[
                    section.body as
                      keyof InstitutionalContent
                  ] ?? '',
                )
              }
              onChange={(value) =>
                update(
                  section.body as
                    keyof InstitutionalContent,
                  value,
                )
              }
            />
          </section>
        ))}

        <section className="admin-section">
          <h2 className="admin-title">
            Coordonnées
          </h2>

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <AdminField
              label="E-mail"
              value={
                content
                  .contactEmail ?? ''
              }
              onChange={(value) =>
                update(
                  'contactEmail',
                  value,
                )
              }
            />

            <AdminField
              label="Téléphone"
              value={
                content
                  .contactPhone ?? ''
              }
              onChange={(value) =>
                update(
                  'contactPhone',
                  value,
                )
              }
            />
          </div>

          <AdminTextarea
            label="Adresse"
            value={
              content
                .contactAddress ?? ''
            }
            onChange={(value) =>
              update(
                'contactAddress',
                value,
              )
            }
          />
        </section>

        <CollectionEditor
          title="Missions"
          value={
            collections.missions
          }
          onChange={(value) =>
            setCollections(
              (current) => ({
                ...current,
                missions: value,
              }),
            )
          }
        />

        <CollectionEditor
          title="Chiffres clés"
          value={
            collections.keyFigures
          }
          onChange={(value) =>
            setCollections(
              (current) => ({
                ...current,
                keyFigures: value,
              }),
            )
          }
        />

        <CollectionEditor
          title="Membres du bureau"
          value={
            collections
              .executiveMembers
          }
          onChange={(value) =>
            setCollections(
              (current) => ({
                ...current,
                executiveMembers:
                  value,
              }),
            )
          }
        />

        <CollectionEditor
          title="Partenaires"
          value={
            collections.partners
          }
          onChange={(value) =>
            setCollections(
              (current) => ({
                ...current,
                partners: value,
              }),
            )
          }
        />

        <CollectionEditor
          title="Documents"
          value={
            collections.documents
          }
          onChange={(value) =>
            setCollections(
              (current) => ({
                ...current,
                documents: value,
              }),
            )
          }
        />
      </form>
    </main>
  );
}

function AdminField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
}) {
  return (
    <label className="admin-label">
      {label}

      <input
        className="admin-input"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
      />
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
  onChange:
    (value: string) => void;
}) {
  return (
    <label className="admin-label">
      {label}

      <textarea
        className="
          admin-input
          min-h-32
          py-3
        "
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
      />
    </label>
  );
}

function CollectionEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange:
    (value: string) => void;
}) {
  return (
    <section className="admin-section">
      <h2 className="admin-title">
        {title}
      </h2>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-slate-600
        "
      >
        Modifiez les éléments au
        format JSON. Les propriétés
        `displayOrder` définissent
        l’ordre d’affichage et
        `isPublished` contrôle la
        publication.
      </p>

      <textarea
        spellCheck={false}
        className="
          mt-5
          min-h-96
          w-full
          rounded-xl
          border
          border-slate-300
          bg-slate-950
          p-4
          font-mono
          text-sm
          leading-6
          text-slate-100
          outline-none
          focus:border-red-500
        "
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
      />
    </section>
  );
}