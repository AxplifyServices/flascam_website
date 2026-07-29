import type {
  Metadata,
} from 'next';

import {
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

import {
  ContactForm,
} from '@/components/institutional/contact-form';

import {
  PublicFooter,
} from '@/components/site/public-footer';

import {
  PublicHeader,
} from '@/components/site/public-header';

import {
  getPublicAssociationBySlug,
} from '@/lib/associations-api';

export const metadata: Metadata = {
  title:
    'Contact | FLASCAM',

  description:
    'Contactez FLASCAM ou adressez directement votre demande à une association régionale.',

  alternates: {
    canonical:
      '/contact',
  },
};

type ContactPageProps = {
  searchParams: Promise<{
    association?:
      string;
  }>;
};

export default async function ContactPage({
  searchParams,
}: ContactPageProps) {
  const {
    association:
      associationSlug,
  } = await searchParams;

  const association =
    associationSlug
      ? await getPublicAssociationBySlug(
          associationSlug,
        ).catch(
          () => null,
        )
      : null;

  return (
    <>
      <PublicHeader />

      <main>
        <section
          className="
            relative
            overflow-hidden
            border-b
            border-slate-200
            bg-[#f5f9fc]
            py-12
            sm:py-16
            lg:py-20
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              -right-24
              -top-24
              h-72
              w-72
              rounded-full
              bg-[#0f5f9f]/10
              blur-3xl
            "
          />

          <div className="site-container relative">
            <p
              className="
                text-xs
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-[#c96f4a]
              "
            >
              Nous contacter
            </p>

            <h1
              className="
                mt-4
                max-w-3xl
                text-3xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-4xl
                lg:text-5xl
              "
            >
              {association
                ? `Contacter ${association.name}`
                : 'Parlez-nous de votre demande'}
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-base
                leading-8
                text-slate-600
                sm:text-lg
              "
            >
              {association
                ? 'Votre demande sera transmise à cette association et restera également accessible à l’administration FLASCAM.'
                : 'Décrivez votre besoin. Nos équipes pourront l’identifier, l’orienter et suivre son traitement depuis un espace sécurisé.'}
            </p>
          </div>
        </section>

        <section
          className="
            bg-white
            py-12
            sm:py-16
            lg:py-20
          "
        >
          <div
            className="
              site-container
              grid
              gap-10
              lg:grid-cols-[minmax(0,1fr)_22rem]
              lg:items-start
            "
          >
            <div className="min-w-0">
              <ContactForm
                association={
                  association
                    ? {
                        id:
                          association.id,
                        name:
                          association.name,
                      }
                    : null
                }
              />
            </div>

            <aside
              className="
                space-y-5
                lg:sticky
                lg:top-28
              "
            >
              <div
                className="
                  rounded-2xl
                  bg-[#0f5f9f]
                  p-6
                  !text-white
                "
              >
                <ShieldCheck
                  size={28}
                  aria-hidden="true"
                />

                <h2
                  className="
                    mt-5
                    text-xl
                    font-extrabold
                    !text-white
                  "
                >
                  Un suivi structuré
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    !text-white/85
                  "
                >
                  Chaque demande
                  devient un ticket
                  pouvant être suivi
                  jusqu’à sa clôture.
                </p>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-6
                "
              >
                <h2
                  className="
                    text-lg
                    font-extrabold
                    text-slate-950
                  "
                >
                  FLASCAM
                </h2>

                <div
                  className="
                    mt-5
                    space-y-4
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  <p
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <Mail
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-[#c96f4a]
                      "
                    />

                    contact@flascam.ma
                  </p>

                  <p
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <MapPin
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-[#c96f4a]
                      "
                    />

                    Maroc
                  </p>

                  {association && (
                    <p
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <Building2
                        size={18}
                        className="
                          mt-0.5
                          shrink-0
                          text-[#c96f4a]
                        "
                      />

                      {
                        association.name
                      }
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}