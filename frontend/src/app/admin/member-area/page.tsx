import {
  CheckCircle2,
  Construction,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

export default function MemberAreaPage() {
  return (
    <section
      className="
        mx-auto
        w-full
        max-w-6xl
      "
    >
      <div
        className="
          blue-gradient-bg
          overflow-hidden
          rounded-[2rem]
          border
          border-[var(--flascam-border)]
          p-5
          shadow-[0_24px_70px_rgba(7,53,93,0.08)]
          sm:p-7
          lg:p-9
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              max-w-3xl
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
              <UserRound
                size={16}
              />

              Espace adhérent
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
              Bienvenue dans votre
              espace professionnel
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-[var(--flascam-slate)]
                sm:text-base
              "
            >
              Votre compte adhérent
              est actif et sécurisé.
              Les services
              professionnels seront
              progressivement ajoutés
              à cet espace selon les
              accès définis par
              FLASCAM.
            </p>
          </div>

          <div
            className="
              grid
              size-24
              shrink-0
              place-items-center
              self-center
              rounded-[2rem]
              border
              border-white/70
              bg-white
              text-[var(--flascam-blue)]
              shadow-[0_20px_50px_rgba(7,53,93,0.12)]
              lg:size-28
            "
          >
            <ShieldCheck
              size={46}
              strokeWidth={1.8}
            />
          </div>
        </div>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4
          md:grid-cols-2
        "
      >
        <article
          className="
            rounded-3xl
            border
            border-emerald-200
            bg-emerald-50
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                grid
                size-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-white
                text-emerald-700
                shadow-sm
              "
            >
              <CheckCircle2
                size={22}
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-extrabold
                  text-emerald-950
                "
              >
                Compte validé
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-emerald-900/80
                "
              >
                Votre adhésion a été
                validée par FLASCAM.
                Vous pouvez utiliser
                vos identifiants pour
                accéder à cet espace.
              </p>
            </div>
          </div>
        </article>

        <article
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
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                grid
                size-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#fff3ee]
                text-[var(--flascam-terracotta)]
              "
            >
              <Construction
                size={22}
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  font-extrabold
                  text-slate-950
                "
              >
                Services à venir
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[var(--flascam-slate)]
                "
              >
                Aucun service métier
                ne vous est encore
                attribué. Les futurs
                modules apparaîtront
                automatiquement dans
                la navigation lorsqu’ils
                seront disponibles.
              </p>
            </div>
          </div>
        </article>
      </div>

      <div
        className="
          mt-6
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
            items-start
            gap-4
          "
        >
          <div
            className="
              grid
              size-11
              shrink-0
              place-items-center
              rounded-2xl
              bg-[#eaf5ff]
              text-[var(--flascam-blue)]
            "
          >
            <LockKeyhole
              size={21}
            />
          </div>

          <div>
            <h2
              className="
                text-lg
                font-extrabold
                text-slate-950
              "
            >
              Sécurité du compte
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[var(--flascam-slate)]
              "
            >
              Conservez vos
              identifiants de manière
              confidentielle et
              déconnectez-vous après
              utilisation d’un appareil
              partagé. FLASCAM ne vous
              demandera jamais votre
              mot de passe par
              téléphone ou par
              message.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}