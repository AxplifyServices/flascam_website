'use client';

import {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Camera,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  FileVideo2,
  Gauge,
  ImagePlus,
  LoaderCircle,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import {
  createMarketplaceListing,
  uploadMarketplaceImage,
  uploadMarketplaceVideo,
} from '@/lib/marketplace-api';

import type {
  MarketplaceFuelType,
  MarketplaceListingMediaInput,
  MarketplaceListingPayload,
  MarketplaceTransmission,
  MarketplaceVehicleType,
  UploadedMarketplaceMedia,
} from '@/types/marketplace';

import {
  MARKETPLACE_FUEL_LABELS,
  MARKETPLACE_TRANSMISSION_LABELS,
  MARKETPLACE_VEHICLE_TYPE_LABELS,
} from '@/types/marketplace';

type FormState = {
  title: string;
  description: string;

  vehicleType:
    MarketplaceVehicleType;

  brand: string;
  model: string;
  version: string;

  registrationYear: string;
  firstRegistrationDate: string;

  mileageKm: string;

  fuelType:
    MarketplaceFuelType;

  transmission:
    MarketplaceTransmission;

  fiscalPower: string;
  enginePowerHp: string;
  engineCapacityCc: string;

  bodyType: string;
  exteriorColor: string;
  interiorColor: string;

  doorsCount: string;
  seatsCount: string;

  registrationCity: string;

  requestedPrice: string;
  durationDays: string;

  seoTitle: string;
  seoDescription: string;
};

type PendingMedia = {
  localId: string;

  mediaAssetId: string;

  mediaKind:
    | 'IMAGE'
    | 'VIDEO';

  url: string;

  originalFilename: string;
  mimeType: string;
  sizeBytes: number;

  altText: string;
  caption: string;
};

const CURRENT_YEAR =
  new Date().getFullYear();

const INITIAL_STATE:
  FormState = {
    title:
      '',

    description:
      '',

    vehicleType:
      'CAR',

    brand:
      '',

    model:
      '',

    version:
      '',

    registrationYear:
      String(
        CURRENT_YEAR,
      ),

    firstRegistrationDate:
      '',

    mileageKm:
      '',

    fuelType:
      'DIESEL',

    transmission:
      'MANUAL',

    fiscalPower:
      '',

    enginePowerHp:
      '',

    engineCapacityCc:
      '',

    bodyType:
      '',

    exteriorColor:
      '',

    interiorColor:
      '',

    doorsCount:
      '',

    seatsCount:
      '',

    registrationCity:
      '',

    requestedPrice:
      '',

    durationDays:
      '15',

    seoTitle:
      '',

    seoDescription:
      '',
  };

const INPUT_CLASS = `
  h-12
  w-full
  rounded-2xl
  border
  border-slate-200
  bg-slate-50
  px-4
  text-sm
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[var(--flascam-blue)]
  focus:bg-white
  focus:ring-4
  focus:ring-blue-100
`;

const TEXTAREA_CLASS = `
  min-h-36
  w-full
  resize-y
  rounded-2xl
  border
  border-slate-200
  bg-slate-50
  px-4
  py-3
  text-sm
  leading-6
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-[var(--flascam-blue)]
  focus:bg-white
  focus:ring-4
  focus:ring-blue-100
`;

function optionalNumber(
  value:
    string,
) {
  const normalized =
    value.trim();

  if (!normalized) {
    return undefined;
  }

  const number =
    Number(
      normalized,
    );

  return Number.isFinite(
    number,
  )
    ? number
    : undefined;
}

function requiredNumber(
  value:
    string,
) {
  return Number(
    value.trim(),
  );
}

function optionalText(
  value:
    string,
) {
  const normalized =
    value.trim();

  return normalized ||
    undefined;
}

function formatFileSize(
  bytes:
    number,
) {
  if (
    bytes <
    1024 *
      1024
  ) {
    return `${Math.max(
      1,
      Math.round(
        bytes /
          1024,
      ),
    )} Ko`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1,
  )} Mo`;
}

function createLocalMedia(
  uploaded:
    UploadedMarketplaceMedia,
): PendingMedia {
  return {
    localId:
      crypto.randomUUID(),

    mediaAssetId:
      uploaded.mediaAssetId,

    mediaKind:
      uploaded.mediaType,

    url:
      uploaded.url,

    originalFilename:
      uploaded.originalFilename,

    mimeType:
      uploaded.mimeType,

    sizeBytes:
      uploaded.sizeBytes,

    altText:
      '',

    caption:
      '',
  };
}

export function MarketplaceListingForm() {
  const router =
    useRouter();

  const imageInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const videoInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [
    form,
    setForm,
  ] = useState<FormState>(
    INITIAL_STATE,
  );

  const [
    media,
    setMedia,
  ] = useState<
    PendingMedia[]
  >([]);

  const [
    uploadingImages,
    setUploadingImages,
  ] = useState(
    false,
  );

  const [
    uploadingVideo,
    setUploadingVideo,
  ] = useState(
    false,
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(
    false,
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

  const images =
    useMemo(
      () =>
        media.filter(
          (
            item,
          ) =>
            item.mediaKind ===
            'IMAGE',
        ),
      [
        media,
      ],
    );

  const video =
    useMemo(
      () =>
        media.find(
          (
            item,
          ) =>
            item.mediaKind ===
            'VIDEO',
        ) ??
        null,
      [
        media,
      ],
    );

  const isBusy =
    uploadingImages ||
    uploadingVideo ||
    submitting;

  function updateField<
    Key extends keyof FormState,
  >(
    key:
      Key,

    value:
      FormState[Key],
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

  async function handleImagesSelected(
    files:
      FileList | null,
  ) {
    if (
      !files ||
      files.length ===
        0
    ) {
      return;
    }

    const selectedFiles =
      Array.from(
        files,
      );

    if (
      images.length +
        selectedFiles.length >
      12
    ) {
      setError(
        `Vous pouvez importer au maximum 12 images. Vous en avez déjà ${images.length}.`,
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          '';
      }

      return;
    }

    setUploadingImages(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const uploadedMedia:
        PendingMedia[] =
        [];

      /*
       * Import séquentiel volontaire :
       * - préserve l’ordre choisi par l’utilisateur ;
       * - évite de lancer 12 gros transferts simultanément ;
       * - simplifie l’affichage des erreurs.
       */
      for (
        const file of
        selectedFiles
      ) {
        const uploaded =
          await uploadMarketplaceImage(
            file,
          );

        uploadedMedia.push(
          createLocalMedia(
            uploaded,
          ),
        );
      }

      setMedia(
        (
          current,
        ) => [
          ...current,
          ...uploadedMedia,
        ],
      );

      setSuccess(
        `${uploadedMedia.length} image${
          uploadedMedia.length >
          1
            ? 's ont'
            : ' a'
        } été importée${
          uploadedMedia.length >
          1
            ? 's'
            : ''
        }.`,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'L’import des images a échoué.',
      );
    } finally {
      setUploadingImages(
        false,
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          '';
      }
    }
  }

  async function handleVideoSelected(
    file:
      File | null,
  ) {
    if (!file) {
      return;
    }

    if (video) {
      setError(
        'Une seule vidéo est autorisée par annonce.',
      );

      if (
        videoInputRef.current
      ) {
        videoInputRef.current.value =
          '';
      }

      return;
    }

    setUploadingVideo(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const uploaded =
        await uploadMarketplaceVideo(
          file,
        );

      setMedia(
        (
          current,
        ) => [
          ...current,
          createLocalMedia(
            uploaded,
          ),
        ],
      );

      setSuccess(
        'La vidéo a été importée.',
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'L’import de la vidéo a échoué.',
      );
    } finally {
      setUploadingVideo(
        false,
      );

      if (
        videoInputRef.current
      ) {
        videoInputRef.current.value =
          '';
      }
    }
  }

  function removeMedia(
    localId:
      string,
  ) {
    setMedia(
      (
        current,
      ) =>
        current.filter(
          (
            item,
          ) =>
            item.localId !==
            localId,
        ),
    );
  }

  function moveMedia(
    localId:
      string,

    direction:
      -1 | 1,
  ) {
    setMedia(
      (
        current,
      ) => {
        const currentIndex =
          current.findIndex(
            (
              item,
            ) =>
              item.localId ===
              localId,
          );

        if (
          currentIndex <
          0
        ) {
          return current;
        }

        const nextIndex =
          currentIndex +
          direction;

        if (
          nextIndex <
            0 ||
          nextIndex >=
            current.length
        ) {
          return current;
        }

        const next =
          [
            ...current,
          ];

        const [
          moved,
        ] =
          next.splice(
            currentIndex,
            1,
          );

        next.splice(
          nextIndex,
          0,
          moved,
        );

        return next;
      },
    );
  }

  function updateMediaText(
    localId:
      string,

    field:
      'altText'
      | 'caption',

    value:
      string,
  ) {
    setMedia(
      (
        current,
      ) =>
        current.map(
          (
            item,
          ) =>
            item.localId ===
            localId
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item,
        ),
    );
  }

  function validateForm() {
    if (
      !form.title.trim()
    ) {
      return 'Le titre de l’annonce est obligatoire.';
    }

    if (
      !form.brand.trim()
    ) {
      return 'La marque du véhicule est obligatoire.';
    }

    if (
      !form.model.trim()
    ) {
      return 'Le modèle du véhicule est obligatoire.';
    }

    const registrationYear =
      requiredNumber(
        form.registrationYear,
      );

    if (
      !Number.isInteger(
        registrationYear,
      ) ||
      registrationYear <
        1900 ||
      registrationYear >
        CURRENT_YEAR +
          1
    ) {
      return 'L’année du véhicule est invalide.';
    }

    const mileage =
      requiredNumber(
        form.mileageKm,
      );

    if (
      !Number.isInteger(
        mileage,
      ) ||
      mileage <
        0
    ) {
      return 'Le kilométrage doit être un nombre entier positif.';
    }

    const price =
      requiredNumber(
        form.requestedPrice,
      );

    if (
      !Number.isFinite(
        price,
      ) ||
      price <=
        0
    ) {
      return 'Le prix demandé doit être supérieur à zéro.';
    }

    const duration =
      requiredNumber(
        form.durationDays,
      );

    if (
      !Number.isInteger(
        duration,
      ) ||
      duration <
        1 ||
      duration >
        30
    ) {
      return 'La durée de publication doit être comprise entre 1 et 30 jours.';
    }

    if (
      form.firstRegistrationDate
    ) {
      const date =
        new Date(
          form.firstRegistrationDate,
        );

      if (
        Number.isNaN(
          date.getTime(),
        ) ||
        date.getFullYear() !==
          registrationYear
      ) {
        return 'La date de première mise en circulation doit correspondre à l’année indiquée.';
      }
    }

    return null;
  }

  function buildPayload():
    MarketplaceListingPayload {
    const mediaPayload:
      MarketplaceListingMediaInput[] =
      media.map(
        (
          item,
          index,
        ) => ({
          mediaAssetId:
            item.mediaAssetId,

          mediaKind:
            item.mediaKind,

          displayOrder:
            index,

          altText:
            optionalText(
              item.altText,
            ),

          caption:
            optionalText(
              item.caption,
            ),
        }),
      );

    return {
      title:
        form.title.trim(),

      description:
        optionalText(
          form.description,
        ),

      vehicleType:
        form.vehicleType,

      brand:
        form.brand.trim(),

      model:
        form.model.trim(),

      version:
        optionalText(
          form.version,
        ),

      registrationYear:
        requiredNumber(
          form.registrationYear,
        ),

      firstRegistrationDate:
        form.firstRegistrationDate ||
        undefined,

      mileageKm:
        requiredNumber(
          form.mileageKm,
        ),

      fuelType:
        form.fuelType,

      transmission:
        form.transmission,

      fiscalPower:
        optionalNumber(
          form.fiscalPower,
        ),

      enginePowerHp:
        optionalNumber(
          form.enginePowerHp,
        ),

      engineCapacityCc:
        optionalNumber(
          form.engineCapacityCc,
        ),

      bodyType:
        optionalText(
          form.bodyType,
        ),

      exteriorColor:
        optionalText(
          form.exteriorColor,
        ),

      interiorColor:
        optionalText(
          form.interiorColor,
        ),

      doorsCount:
        optionalNumber(
          form.doorsCount,
        ),

      seatsCount:
        optionalNumber(
          form.seatsCount,
        ),

      registrationCity:
        optionalText(
          form.registrationCity,
        ),

      requestedPrice:
        requiredNumber(
          form.requestedPrice,
        ),

      currencyCode:
        'MAD',

      durationDays:
        requiredNumber(
          form.durationDays,
        ),

      seoTitle:
        optionalText(
          form.seoTitle,
        ),

      seoDescription:
        optionalText(
          form.seoDescription,
        ),

      media:
        mediaPayload,
    };
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );

      setSuccess(
        null,
      );

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });

      return;
    }

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const created =
        await createMarketplaceListing(
          buildPayload(),
        );

      router.push(
        `/admin/my-marketplace-listings/${created.id}`,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'La création du brouillon a échoué.',
      );

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      });
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="
        mx-auto
        w-full
        max-w-[1500px]
      "
    >
      <header
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div>
          <button
            type="button"
            onClick={() =>
              router.push(
                '/admin/my-marketplace-listings',
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-[var(--flascam-blue)]
              transition
              hover:opacity-70
            "
          >
            <ArrowLeft
              size={18}
            />

            Retour à mes annonces
          </button>

          <p
            className="
              mt-5
              text-sm
              font-bold
              uppercase
              tracking-[0.16em]
              text-[var(--flascam-terracotta)]
            "
          >
            Marketplace FLASCAM
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-4xl
            "
          >
            Déposer un véhicule
          </h1>

          <p
            className="
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-slate-600
              sm:text-base
            "
          >
            Présentez votre véhicule avec des informations claires
            et des visuels de qualité. Votre identité restera
            confidentielle pendant toute la phase de négociation.
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-blue-100
            bg-blue-50
            px-4
            py-3
            text-sm
            leading-5
            text-[var(--flascam-blue)]
          "
        >
          <strong>
            Étape actuelle :
          </strong>
          {' '}
          création du brouillon
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            text-sm
            font-semibold
            text-red-700
          "
        >
          <AlertCircle
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div
          className="
            mt-6
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-sm
            font-semibold
            text-emerald-700
          "
        >
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span>
            {success}
          </span>
        </div>
      )}

      <div
        className="
          mt-7
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_360px]
        "
      >
        <div
          className="
            space-y-6
          "
        >
          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  grid
                  size-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-blue-50
                  text-[var(--flascam-blue)]
                "
              >
                <CarFront
                  size={22}
                />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-black
                    text-slate-950
                  "
                >
                  Présentation du véhicule
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  "
                >
                  Les informations principales visibles dès la carte
                  de l’annonce.
                </p>
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <label
                className="
                  md:col-span-2
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Titre de l’annonce
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <input
                  value={
                    form.title
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'title',
                      event.target.value,
                    )
                  }
                  maxLength={
                    255
                  }
                  placeholder="Ex. Dacia Duster bien entretenue, prête à prendre la route"
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Type de véhicule
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <select
                  value={
                    form.vehicleType
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'vehicleType',
                      event.target.value as
                        MarketplaceVehicleType,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                >
                  {(
                    Object.entries(
                      MARKETPLACE_VEHICLE_TYPE_LABELS,
                    ) as Array<
                      [
                        MarketplaceVehicleType,
                        string,
                      ]
                    >
                  ).map(
                    (
                      [
                        value,
                        label,
                      ],
                    ) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {
                          label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Marque
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <input
                  value={
                    form.brand
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'brand',
                      event.target.value,
                    )
                  }
                  maxLength={
                    120
                  }
                  placeholder="Ex. Dacia"
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Modèle
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <input
                  value={
                    form.model
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'model',
                      event.target.value,
                    )
                  }
                  maxLength={
                    160
                  }
                  placeholder="Ex. Duster"
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Version ou finition
                </span>

                <input
                  value={
                    form.version
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'version',
                      event.target.value,
                    )
                  }
                  maxLength={
                    160
                  }
                  placeholder="Ex. Prestige 4x2"
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Année
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <input
                  type="number"
                  min={
                    1900
                  }
                  max={
                    CURRENT_YEAR +
                    1
                  }
                  value={
                    form.registrationYear
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'registrationYear',
                      event.target.value,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Première mise en circulation
                </span>

                <input
                  type="date"
                  value={
                    form.firstRegistrationDate
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'firstRegistrationDate',
                      event.target.value,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                />
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Kilométrage
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <div className="relative">
                  <Gauge
                    size={18}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="number"
                    min={
                      0
                    }
                    step={
                      1
                    }
                    value={
                      form.mileageKm
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        'mileageKm',
                        event.target.value,
                      )
                    }
                    placeholder="Ex. 85000"
                    className={`
                      ${INPUT_CLASS}
                      pl-11
                      pr-14
                    `}
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      font-semibold
                      text-slate-400
                    "
                  >
                    km
                  </span>
                </div>
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Énergie
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <select
                  value={
                    form.fuelType
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'fuelType',
                      event.target.value as
                        MarketplaceFuelType,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                >
                  {(
                    Object.entries(
                      MARKETPLACE_FUEL_LABELS,
                    ) as Array<
                      [
                        MarketplaceFuelType,
                        string,
                      ]
                    >
                  ).map(
                    (
                      [
                        value,
                        label,
                      ],
                    ) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {
                          label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Boîte de vitesses
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <select
                  value={
                    form.transmission
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'transmission',
                      event.target.value as
                        MarketplaceTransmission,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                >
                  {(
                    Object.entries(
                      MARKETPLACE_TRANSMISSION_LABELS,
                    ) as Array<
                      [
                        MarketplaceTransmission,
                        string,
                      ]
                    >
                  ).map(
                    (
                      [
                        value,
                        label,
                      ],
                    ) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {
                          label
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label
                className="
                  md:col-span-2
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Description
                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'description',
                      event.target.value,
                    )
                  }
                  maxLength={
                    10_000
                  }
                  placeholder="Racontez l’histoire du véhicule : son usage, son entretien, ses points forts et les équipements qui le rendent agréable au quotidien."
                  className={
                    TEXTAREA_CLASS
                  }
                />

                <span
                  className="
                    mt-2
                    block
                    text-xs
                    text-slate-400
                  "
                >
                  Ne saisissez ni nom, ni téléphone, ni adresse e-mail.
                  L’annonce doit rester anonyme.
                </span>
              </label>
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  grid
                  size-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-orange-50
                  text-[var(--flascam-terracotta)]
                "
              >
                <CircleDollarSign
                  size={22}
                />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-black
                    text-slate-950
                  "
                >
                  Prix et durée
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  "
                >
                  La durée commence uniquement après validation par la
                  FLASCAM.
                </p>
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Prix demandé
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <div className="relative">
                  <input
                    type="number"
                    min={
                      1
                    }
                    step={
                      1
                    }
                    value={
                      form.requestedPrice
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        'requestedPrice',
                        event.target.value,
                      )
                    }
                    placeholder="Ex. 165000"
                    className={`
                      ${INPUT_CLASS}
                      pr-20
                    `}
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      font-black
                      text-slate-500
                    "
                  >
                    MAD
                  </span>
                </div>
              </label>

              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Durée de publication
                  {' '}
                  <span className="text-red-500">
                    *
                  </span>
                </span>

                <select
                  value={
                    form.durationDays
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      'durationDays',
                      event.target.value,
                    )
                  }
                  className={
                    INPUT_CLASS
                  }
                >
                  {Array.from(
                    {
                      length:
                        30,
                    },
                    (
                      _,
                      index,
                    ) =>
                      index +
                      1,
                  ).map(
                    (
                      day,
                    ) => (
                      <option
                        key={
                          day
                        }
                        value={
                          day
                        }
                      >
                        {
                          day
                        }
                        {' '}
                        jour
                        {
                          day >
                          1
                            ? 's'
                            : ''
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  grid
                  size-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-violet-50
                  text-violet-700
                "
              >
                <Gauge
                  size={22}
                />
              </div>

              <div>
                <h2
                  className="
                    text-xl
                    font-black
                    text-slate-950
                  "
                >
                  Caractéristiques complémentaires
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-5
                    text-slate-500
                  "
                >
                  Ces champs sont facultatifs, mais facilitent la
                  décision des acheteurs.
                </p>
              </div>
            </div>

            <div
              className="
                mt-6
                grid
                gap-5
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {[
                {
                  key:
                    'fiscalPower',

                  label:
                    'Puissance fiscale',

                  placeholder:
                    'Ex. 8',
                },
                {
                  key:
                    'enginePowerHp',

                  label:
                    'Puissance moteur (ch)',

                  placeholder:
                    'Ex. 115',
                },
                {
                  key:
                    'engineCapacityCc',

                  label:
                    'Cylindrée (cm³)',

                  placeholder:
                    'Ex. 1461',
                },
                {
                  key:
                    'doorsCount',

                  label:
                    'Nombre de portes',

                  placeholder:
                    'Ex. 5',
                },
                {
                  key:
                    'seatsCount',

                  label:
                    'Nombre de places',

                  placeholder:
                    'Ex. 5',
                },
              ].map(
                (
                  item,
                ) => (
                  <label
                    key={
                      item.key
                    }
                  >
                    <span
                      className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-700
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                    <input
                      type="number"
                      min={
                        1
                      }
                      value={
                        form[
                          item.key as
                            | 'fiscalPower'
                            | 'enginePowerHp'
                            | 'engineCapacityCc'
                            | 'doorsCount'
                            | 'seatsCount'
                        ]
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          item.key as
                            | 'fiscalPower'
                            | 'enginePowerHp'
                            | 'engineCapacityCc'
                            | 'doorsCount'
                            | 'seatsCount',

                          event.target.value,
                        )
                      }
                      placeholder={
                        item.placeholder
                      }
                      className={
                        INPUT_CLASS
                      }
                    />
                  </label>
                ),
              )}

              {[
                {
                  key:
                    'bodyType',

                  label:
                    'Carrosserie',

                  placeholder:
                    'Ex. SUV',
                },
                {
                  key:
                    'exteriorColor',

                  label:
                    'Couleur extérieure',

                  placeholder:
                    'Ex. Gris métallisé',
                },
                {
                  key:
                    'interiorColor',

                  label:
                    'Couleur intérieure',

                  placeholder:
                    'Ex. Noir',
                },
                {
                  key:
                    'registrationCity',

                  label:
                    'Ville d’immatriculation',

                  placeholder:
                    'Ex. Casablanca',
                },
              ].map(
                (
                  item,
                ) => (
                  <label
                    key={
                      item.key
                    }
                  >
                    <span
                      className="
                        mb-2
                        block
                        text-sm
                        font-bold
                        text-slate-700
                      "
                    >
                      {
                        item.label
                      }
                    </span>

                    <input
                      value={
                        form[
                          item.key as
                            | 'bodyType'
                            | 'exteriorColor'
                            | 'interiorColor'
                            | 'registrationCity'
                        ]
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          item.key as
                            | 'bodyType'
                            | 'exteriorColor'
                            | 'interiorColor'
                            | 'registrationCity',

                          event.target.value,
                        )
                      }
                      placeholder={
                        item.placeholder
                      }
                      className={
                        INPUT_CLASS
                      }
                    />
                  </label>
                ),
              )}
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.05)]
              sm:p-7
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <div
                  className="
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-700
                  "
                >
                  <Camera
                    size={22}
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xl
                      font-black
                      text-slate-950
                    "
                  >
                    Photos et vidéo
                  </h2>

                  <p
                    className="
                      mt-1
                      max-w-2xl
                      text-sm
                      leading-5
                      text-slate-500
                    "
                  >
                    Ajoutez jusqu’à 12 images et une vidéo. La première
                    image sera utilisée comme couverture.
                  </p>
                </div>
              </div>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1.5
                  text-xs
                  font-black
                  text-slate-600
                "
              >
                {images.length}
                /12 images
              </span>
            </div>

            <div
              className="
                mt-6
                grid
                gap-4
                lg:grid-cols-2
              "
            >
              <button
                type="button"
                disabled={
                  isBusy ||
                  images.length >=
                    12
                }
                onClick={() =>
                  imageInputRef.current?.click()
                }
                className="
                  flex
                  min-h-32
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  rounded-3xl
                  border-2
                  border-dashed
                  border-blue-200
                  bg-blue-50/60
                  px-5
                  py-6
                  text-center
                  text-[var(--flascam-blue)]
                  transition
                  hover:border-[var(--flascam-blue)]
                  hover:bg-blue-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {uploadingImages ? (
                  <LoaderCircle
                    size={28}
                    className="animate-spin"
                  />
                ) : (
                  <ImagePlus
                    size={28}
                  />
                )}

                <span
                  className="
                    text-sm
                    font-black
                  "
                >
                  {uploadingImages
                    ? 'Import des images…'
                    : 'Ajouter des images'}
                </span>

                <span
                  className="
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  JPG, PNG ou WEBP
                </span>
              </button>

              <button
                type="button"
                disabled={
                  isBusy ||
                  Boolean(
                    video,
                  )
                }
                onClick={() =>
                  videoInputRef.current?.click()
                }
                className="
                  flex
                  min-h-32
                  flex-col
                  items-center
                  justify-center
                  gap-3
                  rounded-3xl
                  border-2
                  border-dashed
                  border-violet-200
                  bg-violet-50/60
                  px-5
                  py-6
                  text-center
                  text-violet-700
                  transition
                  hover:border-violet-400
                  hover:bg-violet-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {uploadingVideo ? (
                  <LoaderCircle
                    size={28}
                    className="animate-spin"
                  />
                ) : (
                  <FileVideo2
                    size={28}
                  />
                )}

                <span
                  className="
                    text-sm
                    font-black
                  "
                >
                  {uploadingVideo
                    ? 'Import de la vidéo…'
                    : video
                      ? 'Vidéo déjà ajoutée'
                      : 'Ajouter une vidéo'}
                </span>

                <span
                  className="
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  MP4, WEBM ou MOV
                </span>
              </button>
            </div>

            <input
              ref={
                imageInputRef
              }
              type="file"
              multiple
              accept="
                image/jpeg,
                image/png,
                image/webp
              "
              className="hidden"
              onChange={(
                event,
              ) =>
                void handleImagesSelected(
                  event.target.files,
                )
              }
            />

            <input
              ref={
                videoInputRef
              }
              type="file"
              accept="
                video/mp4,
                video/webm,
                video/quicktime
              "
              className="hidden"
              onChange={(
                event,
              ) =>
                void handleVideoSelected(
                  event.target.files?.[
                    0
                  ] ??
                    null,
                )
              }
            />

            {media.length >
              0 && (
              <div
                className="
                  mt-6
                  space-y-4
                "
              >
                {media.map(
                  (
                    item,
                    index,
                  ) => (
                    <article
                      key={
                        item.localId
                      }
                      className="
                        grid
                        gap-4
                        rounded-3xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4
                        md:grid-cols-[160px_minmax(0,1fr)_auto]
                      "
                    >
                      <div
                        className="
                          relative
                          aspect-[4/3]
                          overflow-hidden
                          rounded-2xl
                          bg-slate-200
                        "
                      >
                        {item.mediaKind ===
                        'IMAGE' ? (
                          <img
                            src={
                              item.url
                            }
                            alt={
                              item.altText ||
                              item.originalFilename
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <video
                            src={
                              item.url
                            }
                            controls
                            preload="metadata"
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        )}

                        <span
                          className="
                            absolute
                            left-2
                            top-2
                            rounded-full
                            bg-slate-950/75
                            px-2.5
                            py-1
                            text-xs
                            font-black
                            text-white
                          "
                        >
                          {index ===
                            0
                            ? 'Couverture'
                            : `Position ${
                                index +
                                1
                              }`}
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
                            items-center
                            gap-2
                          "
                        >
                          <span
                            className="
                              rounded-full
                              bg-white
                              px-2.5
                              py-1
                              text-xs
                              font-black
                              text-slate-600
                            "
                          >
                            {item.mediaKind ===
                            'IMAGE'
                              ? 'Image'
                              : 'Vidéo'}
                          </span>

                          <span
                            className="
                              text-xs
                              font-semibold
                              text-slate-400
                            "
                          >
                            {formatFileSize(
                              item.sizeBytes,
                            )}
                          </span>
                        </div>

                        <p
                          className="
                            mt-2
                            truncate
                            text-sm
                            font-bold
                            text-slate-800
                          "
                        >
                          {
                            item.originalFilename
                          }
                        </p>

                        <div
                          className="
                            mt-4
                            grid
                            gap-3
                          "
                        >
                          <input
                            value={
                              item.altText
                            }
                            onChange={(
                              event,
                            ) =>
                              updateMediaText(
                                item.localId,
                                'altText',
                                event.target.value,
                              )
                            }
                            maxLength={
                              255
                            }
                            placeholder="Description accessible du média"
                            className={
                              INPUT_CLASS
                            }
                          />

                          <input
                            value={
                              item.caption
                            }
                            onChange={(
                              event,
                            ) =>
                              updateMediaText(
                                item.localId,
                                'caption',
                                event.target.value,
                              )
                            }
                            maxLength={
                              1000
                            }
                            placeholder="Légende facultative"
                            className={
                              INPUT_CLASS
                            }
                          />
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          gap-2
                          md:flex-col
                        "
                      >
                        <button
                          type="button"
                          disabled={
                            index ===
                            0
                          }
                          onClick={() =>
                            moveMedia(
                              item.localId,
                              -1,
                            )
                          }
                          aria-label="Remonter le média"
                          className="
                            grid
                            size-10
                            place-items-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          "
                        >
                          <ArrowUp
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          disabled={
                            index ===
                            media.length -
                              1
                          }
                          onClick={() =>
                            moveMedia(
                              item.localId,
                              1,
                            )
                          }
                          aria-label="Descendre le média"
                          className="
                            grid
                            size-10
                            place-items-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-600
                            transition
                            hover:bg-slate-100
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                          "
                        >
                          <ArrowDown
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeMedia(
                              item.localId,
                            )
                          }
                          aria-label="Retirer le média"
                          className="
                            grid
                            size-10
                            place-items-center
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            text-red-700
                            transition
                            hover:bg-red-100
                          "
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        <aside
          className="
            xl:sticky
            xl:top-6
            xl:self-start
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-[var(--flascam-border)]
              bg-white
              p-5
              shadow-[0_18px_50px_rgba(7,53,93,0.07)]
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  grid
                  size-10
                  place-items-center
                  rounded-2xl
                  bg-orange-50
                  text-[var(--flascam-terracotta)]
                "
              >
                <Save
                  size={20}
                />
              </div>

              <div>
                <h2
                  className="
                    font-black
                    text-slate-950
                  "
                >
                  Enregistrer le brouillon
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Aucune publication immédiate
                </p>
              </div>
            </div>

            <div
              className="
                mt-5
                space-y-3
                rounded-2xl
                bg-slate-50
                p-4
                text-sm
                leading-5
                text-slate-600
              "
            >
              <p>
                <strong className="text-slate-800">
                  1.
                </strong>
                {' '}
                Enregistrez le véhicule en brouillon.
              </p>

              <p>
                <strong className="text-slate-800">
                  2.
                </strong>
                {' '}
                Relisez et complétez votre annonce.
              </p>

              <p>
                <strong className="text-slate-800">
                  3.
                </strong>
                {' '}
                Envoyez-la ensuite à la FLASCAM pour validation.
              </p>
            </div>

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-amber-200
                bg-amber-50
                p-4
                text-xs
                leading-5
                text-amber-800
              "
            >
              Au moins une image sera obligatoire au moment de la
              soumission. Elle n’est pas imposée pour enregistrer un
              brouillon.
            </div>

            <button
              type="submit"
              disabled={
                isBusy
              }
              className="
                mt-5
                inline-flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[var(--flascam-terracotta)]
                px-5
                text-sm
                font-black
                text-white
                shadow-[0_14px_35px_rgba(184,91,63,0.22)]
                transition
                hover:-translate-y-0.5
                hover:brightness-95
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? (
                <LoaderCircle
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={19}
                />
              )}

              {submitting
                ? 'Enregistrement…'
                : 'Enregistrer le brouillon'}
            </button>

            <button
              type="button"
              disabled={
                isBusy
              }
              onClick={() =>
                router.push(
                  '/admin/my-marketplace-listings',
                )
              }
              className="
                mt-3
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-5
                text-sm
                font-bold
                text-slate-700
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ArrowLeft
                size={18}
              />

              Annuler
            </button>
          </div>

          <div
            className="
              mt-5
              rounded-3xl
              bg-[var(--flascam-blue)]
              p-5
              text-white
            "
          >
            <UploadCloud
              size={25}
            />

            <h3
              className="
                mt-4
                text-lg
                font-black
              "
            >
              Une annonce convaincante
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-white/80
              "
            >
              Utilisez des photos lumineuses, montrez plusieurs angles
              et décrivez honnêtement l’état du véhicule. Une
              présentation claire facilite les offres sérieuses.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}