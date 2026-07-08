import type {
  Metadata,
} from 'next';

import {
  ArrowDownToLine,
  ArrowRight,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
} from 'lucide-react';

import {
  ContactForm,
} from '@/components/institutional/contact-form';

import type {
  InstitutionalContent,
} from '@/types/institutional';

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

async function getContent():
Promise<InstitutionalContent> {
  const response = await fetch(
    `${API_URL}/institutional/public`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error(
      'Impossible de charger le portail institutionnel.',
    );
  }

  return response.json();
}

export const dynamic =
  'force-dynamic';

export async function generateMetadata():
Promise<Metadata> {
  try {
    const content =
      await getContent();

    return {
      title:
        content.seoTitle ??
        'FLASCAM',
      description:
        content.seoDescription ??
        undefined,
      alternates: {
        canonical: '/',
      },
      openGraph: {
        title:
          content.seoTitle ??
          'FLASCAM',
        description:
          content.seoDescription ??
          undefined,
        type: 'website',
        locale: 'fr_MA',
      },
    };
  } catch {
    return {
      title: 'FLASCAM',
      description:
        'Fédération des loueurs automobiles sans chauffeur au Maroc.',
    };
  }
}

function Eyebrow({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <p className="section-eyebrow">
      {children}
    </p>
  );
}

export default async function Home() {
  const content =
    await getContent();

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-[rgba(5,24,44,0.94)]
          text-white
          backdrop-blur-xl
        "
      >
        <div
          className="
            site-container
            flex
            min-h-20
            items-center
            justify-between
            gap-6
          "
        >
          <a
            href="#accueil"
            className="
              flex
              items-center
              gap-3
            "
            aria-label=
              "Accueil FLASCAM"
          >
            <span
              className="
                grid
                size-11
                place-items-center
                rounded-full
                border
                border-[var(--gold)]
                font-serif
                text-lg
                font-bold
                text-[var(--gold)]
              "
            >
              F
            </span>

            <span>
              <strong
                className="
                  block
                  text-lg
                  tracking-[0.18em]
                "
              >
                FLASCAM
              </strong>

              <span
                className="
                  hidden
                  text-[0.65rem]
                  uppercase
                  tracking-[0.14em]
                  text-white/55
                  sm:block
                "
              >
                Fédération nationale
              </span>
            </span>
          </a>

          <nav
            className="
              hidden
              items-center
              gap-7
              text-sm
              font-medium
              lg:flex
            "
            aria-label=
              "Navigation principale"
          >
            <a
              href="#federation"
              className="nav-link"
            >
              Fédération
            </a>

            <a
              href="#missions"
              className="nav-link"
            >
              Missions
            </a>

            <a
              href="#gouvernance"
              className="nav-link"
            >
              Gouvernance
            </a>

            <a
              href="#partenaires"
              className="nav-link"
            >
              Partenaires
            </a>

            <a
              href="#documents"
              className="nav-link"
            >
              Documents
            </a>

            <a
              href="#contact"
              className="
                rounded-full
                border
                border-[var(--gold)]
                px-5
                py-2.5
                text-[var(--gold)]
                transition
                hover:bg-[var(--gold)]
                hover:text-[var(--navy)]
              "
            >
              Contact
            </a>
          </nav>

          <details
            className="
              relative
              lg:hidden
            "
          >
            <summary
              className="
                grid
                size-11
                cursor-pointer
                list-none
                place-items-center
                rounded-full
                border
                border-white/20
              "
              aria-label=
                "Ouvrir le menu"
            >
              <Menu size={20} />
            </summary>

            <nav
              className="
                absolute
                right-0
                top-14
                flex
                w-64
                flex-col
                rounded-2xl
                border
                border-white/10
                bg-[var(--navy)]
                p-3
                shadow-2xl
              "
            >
              {[
                [
                  '#federation',
                  'Fédération',
                ],
                [
                  '#missions',
                  'Missions',
                ],
                [
                  '#gouvernance',
                  'Gouvernance',
                ],
                [
                  '#partenaires',
                  'Partenaires',
                ],
                [
                  '#documents',
                  'Documents',
                ],
                [
                  '#contact',
                  'Contact',
                ],
              ].map(
                ([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      text-white/80
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    {label}
                  </a>
                ),
              )}
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section
          id="accueil"
          className="
            relative
            isolate
            overflow-hidden
            bg-[var(--navy)]
            text-white
          "
        >
          <div
            className="
              absolute
              inset-0
              -z-20
              bg-[radial-gradient(circle_at_78%_20%,rgba(198,164,91,0.21),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(255,255,255,0.08),transparent_35%)]
            "
          />

          <div
            className="
              absolute
              right-[-12rem]
              top-20
              -z-10
              size-[34rem]
              rounded-full
              border
              border-white/10
            "
          />

          <div
            className="
              absolute
              right-[-5rem]
              top-48
              -z-10
              size-[22rem]
              rounded-full
              border
              border-[var(--gold)]/30
            "
          />

          <div
            className="
              site-container
              grid
              min-h-[calc(100vh-5rem)]
              items-center
              gap-12
              py-20
              lg:grid-cols-[1.25fr_0.75fr]
              lg:py-28
            "
          >
            <div>
              <Eyebrow>
                {content.heroEyebrow}
              </Eyebrow>

              <h1
                className="
                  mt-6
                  max-w-5xl
                  font-serif
                  text-4xl
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.035em]
                  sm:text-6xl
                  lg:text-7xl
                "
              >
                {content.heroTitle}
              </h1>

              <p
                className="
                  mt-7
                  max-w-2xl
                  text-base
                  leading-8
                  text-white/68
                  sm:text-lg
                "
              >
                {content.heroSubtitle}
              </p>

              <div
                className="
                  mt-9
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                "
              >
                {content
                  .heroPrimaryCtaLabel &&
                  content
                    .heroPrimaryCtaUrl && (
                    <a
                      href={
                        content
                          .heroPrimaryCtaUrl
                      }
                      className="
                        inline-flex
                        h-13
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-[var(--gold)]
                        px-7
                        font-semibold
                        text-[var(--navy)]
                        transition
                        hover:bg-[var(--gold-light)]
                      "
                    >
                      {
                        content
                          .heroPrimaryCtaLabel
                      }

                      <ArrowRight
                        size={18}
                      />
                    </a>
                  )}

                {content
                  .heroSecondaryCtaLabel &&
                  content
                    .heroSecondaryCtaUrl && (
                    <a
                      href={
                        content
                          .heroSecondaryCtaUrl
                      }
                      className="
                        inline-flex
                        h-13
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/25
                        px-7
                        font-semibold
                        text-white
                        transition
                        hover:bg-white/10
                      "
                    >
                      {
                        content
                          .heroSecondaryCtaLabel
                      }
                    </a>
                  )}
              </div>
            </div>

            <div
              className="
                grid
                gap-4
                sm:grid-cols-3
                lg:grid-cols-1
              "
            >
              {content.keyFigures
                .slice(0, 3)
                .map((figure) => (
                  <article
                    key={
                      figure.id ??
                      figure.label
                    }
                    className="
                      rounded-[1.75rem]
                      border
                      border-white/10
                      bg-white/[0.06]
                      p-6
                      backdrop-blur-sm
                    "
                  >
                    <strong
                      className="
                        font-serif
                        text-4xl
                        text-[var(--gold)]
                      "
                    >
                      {figure.value}
                    </strong>

                    <p
                      className="
                        mt-2
                        font-semibold
                      "
                    >
                      {figure.label}
                    </p>

                    {figure.description && (
                      <p
                        className="
                          mt-2
                          text-sm
                          leading-6
                          text-white/55
                        "
                      >
                        {
                          figure.description
                        }
                      </p>
                    )}
                  </article>
                ))}
            </div>
          </div>
        </section>

        <section
          id="federation"
          className="
            bg-[var(--ivory)]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-12
              lg:grid-cols-[0.85fr_1.15fr]
              lg:items-center
            "
          >
            <div
              className="
                relative
                min-h-[28rem]
                overflow-hidden
                rounded-[2.5rem]
                bg-[var(--navy)]
                p-8
                text-white
                sm:p-12
              "
            >
              <div
                className="
                  absolute
                  -bottom-24
                  -right-24
                  size-80
                  rounded-full
                  border
                  border-[var(--gold)]/35
                "
              />

              <Building2
                size={42}
                strokeWidth={1.35}
                className=
                  "text-[var(--gold)]"
              />

              <p
                className="
                  mt-24
                  font-serif
                  text-3xl
                  leading-tight
                  sm:text-4xl
                "
              >
                Une voix commune pour
                construire l’avenir de
                la profession.
              </p>

              <div
                className="
                  mt-10
                  h-px
                  w-20
                  bg-[var(--gold)]
                "
              />
            </div>

            <div>
              <Eyebrow>
                {
                  content
                    .federationEyebrow
                }
              </Eyebrow>

              <h2 className="section-title">
                {
                  content
                    .federationTitle
                }
              </h2>

              <p className="section-body">
                {
                  content
                    .federationBody
                }
              </p>

              <div
                className="
                  mt-9
                  grid
                  gap-4
                  sm:grid-cols-2
                "
              >
                <article className="editorial-card">
                  <ShieldCheck
                    size={28}
                  />

                  <h3>
                    Représentation
                    nationale
                  </h3>

                  <p>
                    Une fédération
                    capable de porter
                    les priorités du
                    secteur auprès des
                    institutions.
                  </p>
                </article>

                <article className="editorial-card">
                  <Building2
                    size={28}
                  />

                  <h3>
                    Ancrage régional
                  </h3>

                  <p>
                    Une organisation
                    connectée aux
                    réalités des
                    professionnels dans
                    chaque territoire.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          id="missions"
          className="
            bg-white
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                max-w-3xl
              "
            >
              <Eyebrow>
                {
                  content
                    .missionsEyebrow
                }
              </Eyebrow>

              <h2 className="section-title">
                {
                  content
                    .missionsTitle
                }
              </h2>

              <p className="section-body">
                {
                  content
                    .missionsBody
                }
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                gap-5
                md:grid-cols-2
              "
            >
              {content.missions.map(
                (mission, index) => (
                  <article
                    key={
                      mission.id ??
                      mission.title
                    }
                    className="
                      group
                      rounded-[2rem]
                      border
                      border-slate-200
                      bg-white
                      p-7
                      transition
                      hover:-translate-y-1
                      hover:border-[var(--gold)]
                      hover:shadow-[0_25px_70px_rgba(5,24,44,0.09)]
                      sm:p-9
                    "
                  >
                    <span
                      className="
                        font-serif
                        text-sm
                        text-[var(--gold-dark)]
                      "
                    >
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </span>

                    <h3
                      className="
                        mt-8
                        font-serif
                        text-2xl
                        text-[var(--navy)]
                      "
                    >
                      {mission.title}
                    </h3>

                    <p
                      className="
                        mt-4
                        leading-7
                        text-slate-600
                      "
                    >
                      {
                        mission.description
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          id="gouvernance"
          className="
            overflow-hidden
            bg-[var(--navy)]
            py-20
            text-white
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-12
              lg:grid-cols-[0.8fr_1.2fr]
            "
          >
            <div>
              <Eyebrow>
                {
                  content
                    .governanceEyebrow
                }
              </Eyebrow>

              <h2
                className="
                  section-title
                  text-white
                "
              >
                {
                  content
                    .governanceTitle
                }
              </h2>

              <p
                className="
                  section-body
                  text-white/65
                "
              >
                {
                  content
                    .governanceBody
                }
              </p>
            </div>

            <div>
              <Eyebrow>
                {
                  content
                    .executiveOfficeEyebrow
                }
              </Eyebrow>

              <h2
                className="
                  mt-4
                  font-serif
                  text-3xl
                  sm:text-4xl
                "
              >
                {
                  content
                    .executiveOfficeTitle
                }
              </h2>

              <p
                className="
                  mt-5
                  max-w-2xl
                  leading-7
                  text-white/60
                "
              >
                {
                  content
                    .executiveOfficeBody
                }
              </p>

              <div
                className="
                  mt-10
                  grid
                  gap-5
                  sm:grid-cols-2
                "
              >
                {content
                  .executiveMembers
                  .map((member) => (
                    <article
                      key={
                        member.id ??
                        member.fullName
                      }
                      className="
                        rounded-[1.75rem]
                        border
                        border-white/10
                        bg-white/[0.05]
                        p-6
                      "
                    >
                      {member.imageUrl ? (
                        <img
                          src={
                            member.imageUrl
                          }
                          alt={
                            member.fullName
                          }
                          className="
                            aspect-[4/3]
                            w-full
                            rounded-2xl
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            grid
                            aspect-[4/3]
                            place-items-center
                            rounded-2xl
                            bg-white/[0.07]
                            font-serif
                            text-5xl
                            text-[var(--gold)]
                          "
                        >
                          {member
                            .fullName
                            .charAt(0)}
                        </div>
                      )}

                      <h3
                        className="
                          mt-5
                          font-serif
                          text-xl
                        "
                      >
                        {
                          member.fullName
                        }
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-[var(--gold)]
                        "
                      >
                        {
                          member.position
                        }
                      </p>

                      {member.biography && (
                        <p
                          className="
                            mt-4
                            text-sm
                            leading-6
                            text-white/55
                          "
                        >
                          {
                            member.biography
                          }
                        </p>
                      )}

                      {member.linkedinUrl && (
                        <a
                          href={
                            member.linkedinUrl
                          }
                          target="_blank"
                          rel=
                            "noreferrer"
                          aria-label={
                            `Profil LinkedIn de ${member.fullName}`
                          }
                          className="
                            mt-5
                            inline-flex
                            size-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/15
                            text-white/70
                            transition
                            hover:border-[var(--gold)]
                            hover:text-[var(--gold)]
                          "
                        >
<ExternalLink
  size={17}
/>
                        </a>
                      )}
                    </article>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="partenaires"
          className="
            bg-[var(--ivory)]
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                mx-auto
                max-w-3xl
                text-center
              "
            >
              <Eyebrow>
                {
                  content
                    .partnersEyebrow
                }
              </Eyebrow>

              <h2 className="section-title">
                {
                  content
                    .partnersTitle
                }
              </h2>

              <p className="section-body">
                {
                  content
                    .partnersBody
                }
              </p>
            </div>

            <div
              className="
                mt-12
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {content.partners.map(
                (partner) => (
                  <article
                    key={
                      partner.id ??
                      partner.name
                    }
                    className="
                      flex
                      min-h-52
                      flex-col
                      justify-between
                      rounded-[2rem]
                      border
                      border-[#ded7c8]
                      bg-white
                      p-7
                    "
                  >
                    {partner.logoUrl ? (
                      <img
                        src={
                          partner.logoUrl
                        }
                        alt={
                          `Logo ${partner.name}`
                        }
                        className="
                          h-14
                          max-w-44
                          object-contain
                          object-left
                        "
                      />
                    ) : (
                      <p
                        className="
                          font-serif
                          text-2xl
                          text-[var(--navy)]
                        "
                      >
                        {partner.name}
                      </p>
                    )}

                    <div>
                      {partner.description && (
                        <p
                          className="
                            mt-6
                            text-sm
                            leading-6
                            text-slate-600
                          "
                        >
                          {
                            partner.description
                          }
                        </p>
                      )}

                      {partner.websiteUrl && (
                        <a
                          href={
                            partner.websiteUrl
                          }
                          target="_blank"
                          rel=
                            "noreferrer"
                          className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-semibold
                            text-[var(--navy)]
                          "
                        >
                          Voir le site

                          <ExternalLink
                            size={15}
                          />
                        </a>
                      )}
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          id="documents"
          className="
            bg-white
            py-20
            sm:py-28
          "
        >
          <div className="site-container">
            <div
              className="
                max-w-3xl
              "
            >
              <Eyebrow>
                {
                  content
                    .documentsEyebrow
                }
              </Eyebrow>

              <h2 className="section-title">
                {
                  content
                    .documentsTitle
                }
              </h2>

              <p className="section-body">
                {
                  content
                    .documentsBody
                }
              </p>
            </div>

            <div
              className="
                mt-12
                divide-y
                divide-slate-200
                border-y
                border-slate-200
              "
            >
              {content.documents.map(
                (document) => (
                  <article
                    key={
                      document.id ??
                      document.title
                    }
                    className="
                      grid
                      gap-5
                      py-7
                      md:grid-cols-[1fr_auto]
                      md:items-center
                    "
                  >
                    <div>
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          text-xs
                          font-semibold
                          uppercase
                          tracking-[0.15em]
                          text-[var(--gold-dark)]
                        "
                      >
                        <span>
                          {
                            document.documentType ??
                            'Document'
                          }
                        </span>

                        {document.fileSizeLabel && (
                          <span
                            className="
                              text-slate-400
                            "
                          >
                            {
                              document.fileSizeLabel
                            }
                          </span>
                        )}
                      </div>

                      <h3
                        className="
                          mt-3
                          font-serif
                          text-xl
                          text-[var(--navy)]
                          sm:text-2xl
                        "
                      >
                        {document.title}
                      </h3>

                      {document.description && (
                        <p
                          className="
                            mt-2
                            max-w-3xl
                            text-sm
                            leading-6
                            text-slate-600
                          "
                        >
                          {
                            document.description
                          }
                        </p>
                      )}
                    </div>

                    <a
                      href={
                        document.fileUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        border
                        border-slate-300
                        px-5
                        text-sm
                        font-semibold
                        text-[var(--navy)]
                        transition
                        hover:border-[var(--gold)]
                      "
                    >
                      Télécharger

                      <ArrowDownToLine
                        size={17}
                      />
                    </a>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="
            bg-[var(--ivory)]
            py-20
            sm:py-28
          "
        >
          <div
            className="
              site-container
              grid
              gap-12
              lg:grid-cols-[0.75fr_1.25fr]
            "
          >
            <div>
              <Eyebrow>
                {
                  content
                    .contactEyebrow
                }
              </Eyebrow>

              <h2 className="section-title">
                {
                  content
                    .contactTitle
                }
              </h2>

              <p className="section-body">
                {
                  content
                    .contactBody
                }
              </p>

              <div
                className="
                  mt-9
                  space-y-4
                "
              >
                {content.contactEmail && (
                  <a
                    href={
                      `mailto:${content.contactEmail}`
                    }
                    className="contact-line"
                  >
                    <Mail size={19} />

                    {
                      content.contactEmail
                    }
                  </a>
                )}

                {content.contactPhone && (
                  <a
                    href={
                      `tel:${content.contactPhone}`
                    }
                    className="contact-line"
                  >
                    <Phone size={19} />

                    {
                      content.contactPhone
                    }
                  </a>
                )}

                {content.contactAddress && (
                  <p className="contact-line">
                    <MapPin size={19} />

                    {
                      content.contactAddress
                    }
                  </p>
                )}
              </div>
            </div>

            <ContactForm />
          </div>
        </section>
      </main>

      <footer
        className="
          bg-[var(--navy)]
          py-10
          text-white
        "
      >
        <div
          className="
            site-container
            flex
            flex-col
            gap-6
            border-t
            border-white/10
            pt-8
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <strong
              className="
                tracking-[0.18em]
              "
            >
              FLASCAM
            </strong>

            <p
              className="
                mt-2
                text-sm
                text-white/50
              "
            >
              Fédération des loueurs
              automobiles sans
              chauffeur au Maroc.
            </p>
          </div>

          <p
            className="
              text-sm
              text-white/45
            "
          >
            © {new Date().getFullYear()}
            {' '}FLASCAM. Tous droits
            réservés.
          </p>
        </div>
      </footer>
    </>
  );
}