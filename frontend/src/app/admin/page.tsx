import {
  FileText,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Newspaper,
} from 'lucide-react';

const dashboardCards = [
  {
    title: 'Portail public',
    description:
      'Module disponible pour gérer les contenus institutionnels du site FLASCAM.',
    status: 'Actif',
    icon: FileText,
  },
  {
    title: 'Messages reçus',
    description:
      'Module disponible pour consulter et traiter les demandes envoyées depuis le formulaire de contact.',
    status: 'Actif',
    icon: Inbox,
  },
  {
    title: 'Utilisateurs & rôles',
    description:
      'Module prévu pour gérer les comptes, les rôles et les permissions.',
    status: 'Bientôt',
    icon: ShieldCheck,
  },
  {
    title:
      'Actualités',

    description:
      'Module disponible pour gérer les actualités, événements, communiqués officiels, publications réglementaires et revues de presse.',

    status:
      'Actif',

    icon:
      Newspaper,
  },
  {
  title: 'Associations',
  description:
    'Module disponible pour gérer les associations régionales, leurs pages publiques, leurs actualités, événements et médias.',
  status: 'Actif',
  icon: Building2,
},
];

export default function AdminPage() {
  return (
    <section
      className="
        mx-auto
        max-w-7xl
      "
    >
      <div
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
          <LayoutDashboard
            size={16}
          />
          Tableau de bord
        </p>

        <h1
          className="
            mt-3
            max-w-3xl
            text-3xl
            font-extrabold
            tracking-[-0.04em]
            text-[var(--flascam-black)]
            sm:text-4xl
          "
        >
          Administration FLASCAM
        </h1>

        <p
          className="
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-[var(--flascam-slate)]
            sm:text-base
          "
        >
          Le tableau de bord sert de page d’accueil du
          back-office. La navigation entre les rubriques se fait
          uniquement depuis la sidebar.
        </p>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4
          md:grid-cols-3
        "
      >
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="
                rounded-3xl
                border
                border-[var(--flascam-border)]
                bg-white
                p-5
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    grid
                    size-12
                    place-items-center
                    rounded-2xl
                    bg-[#eaf5ff]
                    text-[var(--flascam-blue)]
                  "
                >
                  <Icon size={22} />
                </div>

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-[0.68rem]
                    font-extrabold
                    uppercase
                    tracking-wide
                    ${
                      card.status ===
                      'Actif'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}
                >
                  {card.status}
                </span>
              </div>

              <h2
                className="
                  mt-5
                  text-lg
                  font-extrabold
                  text-slate-950
                "
              >
                {card.title}
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[var(--flascam-slate)]
                "
              >
                {card.description}
              </p>
            </article>
          );
        })}
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
        <h2
          className="
            text-xl
            font-extrabold
            text-slate-950
          "
        >
          Règle de navigation
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-[var(--flascam-slate)]
          "
        >
          Les cartes du tableau de bord ne sont pas cliquables.
          Pour changer de rubrique, utilisez la sidebar à gauche
          sur desktop ou le bouton menu sur mobile.
        </p>
      </div>
    </section>
  );
}