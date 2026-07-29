'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  Building2,
  CheckCircle2,
  Loader2,
  UserRound,
} from 'lucide-react';

import {
  apiFetch,
} from '@/lib/api';

type RequesterType =
  | 'INDIVIDUAL'
  | 'PROFESSIONAL';

type ContactFormProps = {
  association?: {
    id: string;
    name: string;
  } | null;
};

type FormState = {
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  requesterType:
    RequesterType;
  description: string;
  companyName: string;
  businessSector: string;
  yearsInBusiness: string;
};

const initialState: FormState = {
  firstName: '',
  lastName: '',
  city: '',
  email: '',
  requesterType:
    'INDIVIDUAL',
  description: '',
  companyName: '',
  businessSector: '',
  yearsInBusiness: '',
};

export function ContactForm({
  association = null,
}: ContactFormProps) {
  const [
    form,
    setForm,
  ] = useState<FormState>(
    initialState,
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    sent,
    setSent,
  ] = useState(false);

  function update<
    Field extends keyof FormState,
  >(
    field: Field,
    value: FormState[Field],
  ) {
    setForm((current) => ({
      ...current,
      [field]:
        value,
    }));
  }

  function selectRequesterType(
    requesterType:
      RequesterType,
  ) {
    setForm((current) => ({
      ...current,
      requesterType,

      ...(requesterType ===
      'INDIVIDUAL'
        ? {
            companyName:
              '',
            businessSector:
              '',
            yearsInBusiness:
              '',
          }
        : {}),
    }));
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSent(false);

    const payload = {
      firstName:
        form.firstName,
      lastName:
        form.lastName,
      city:
        form.city,
      email:
        form.email,
      requesterType:
        form.requesterType,
      description:
        form.description,

      associationId:
        association?.id,

      ...(form.requesterType ===
      'PROFESSIONAL'
        ? {
            companyName:
              form.companyName,

            businessSector:
              form.businessSector,

            yearsInBusiness:
              Number(
                form.yearsInBusiness,
              ),
          }
        : {}),
    };

    try {
      const response =
        await apiFetch(
          '/institutional/contact',
          {
            method:
              'POST',

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      if (!response.ok) {
        const responseBody =
          await response
            .json()
            .catch(
              () => null,
            );

        const apiMessage =
          Array.isArray(
            responseBody
              ?.message,
          )
            ? responseBody.message[
                0
              ]
            : responseBody
                ?.message;

        throw new Error(
          typeof apiMessage ===
            'string'
            ? apiMessage
            : 'Votre demande n’a pas pu être envoyée.',
        );
      }

      setForm(
        initialState,
      );

      setSent(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Votre demande n’a pas pu être envoyée. Vérifiez les informations saisies puis réessayez.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="
        rounded-[2rem]
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_30px_90px_rgba(5,24,44,0.12)]
        sm:p-8
      "
    >
      {association && (
        <div
          className="
            mb-7
            rounded-2xl
            border
            border-[#0f5f9f]/15
            bg-[#0f5f9f]/5
            p-4
          "
        >
          <p
            className="
              text-xs
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-[#0f5f9f]
            "
          >
            Destinataire
          </p>

          <p
            className="
              mt-2
              font-bold
              text-slate-950
            "
          >
            {association.name}
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-slate-600
            "
          >
            Cette demande sera
            visible par FLASCAM
            et par l’association.
          </p>
        </div>
      )}

      <fieldset>
        <legend
          className="
            text-sm
            font-extrabold
            text-slate-950
          "
        >
          Vous contactez FLASCAM
          en tant que
        </legend>

        <div
          className="
            mt-3
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          <button
            type="button"
            aria-pressed={
              form.requesterType ===
              'INDIVIDUAL'
            }
            onClick={() =>
              selectRequesterType(
                'INDIVIDUAL',
              )
            }
            className={`
              flex
              min-h-14
              items-center
              gap-3
              rounded-xl
              border
              px-4
              text-left
              transition
              ${
                form.requesterType ===
                'INDIVIDUAL'
                  ? 'border-[#0f5f9f] bg-[#0f5f9f] !text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-[#0f5f9f]/50'
              }
            `}
          >
            <UserRound
              size={20}
              aria-hidden="true"
            />

            <span className="font-bold">
              Particulier
            </span>
          </button>

          <button
            type="button"
            aria-pressed={
              form.requesterType ===
              'PROFESSIONAL'
            }
            onClick={() =>
              selectRequesterType(
                'PROFESSIONAL',
              )
            }
            className={`
              flex
              min-h-14
              items-center
              gap-3
              rounded-xl
              border
              px-4
              text-left
              transition
              ${
                form.requesterType ===
                'PROFESSIONAL'
                  ? 'border-[#c96f4a] bg-[#c96f4a] !text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-[#c96f4a]/50'
              }
            `}
          >
            <Building2
              size={20}
              aria-hidden="true"
            />

            <span className="font-bold">
              Professionnel
            </span>
          </button>
        </div>
      </fieldset>

      <div
        className="
          mt-7
          grid
          gap-5
          sm:grid-cols-2
        "
      >
        <label className="field-label">
          Prénom

          <input
            className="field-input"
            autoComplete="given-name"
            value={
              form.firstName
            }
            onChange={(
              event,
            ) =>
              update(
                'firstName',
                event.target
                  .value,
              )
            }
            required
            minLength={2}
            maxLength={100}
          />
        </label>

        <label className="field-label">
          Nom

          <input
            className="field-input"
            autoComplete="family-name"
            value={
              form.lastName
            }
            onChange={(
              event,
            ) =>
              update(
                'lastName',
                event.target
                  .value,
              )
            }
            required
            minLength={2}
            maxLength={100}
          />
        </label>

        <label className="field-label">
          Ville

          <input
            className="field-input"
            autoComplete="address-level2"
            value={
              form.city
            }
            onChange={(
              event,
            ) =>
              update(
                'city',
                event.target
                  .value,
              )
            }
            required
            minLength={2}
            maxLength={180}
          />
        </label>

        <label className="field-label">
          Adresse e-mail

          <input
            className="field-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={
              form.email
            }
            onChange={(
              event,
            ) =>
              update(
                'email',
                event.target
                  .value,
              )
            }
            required
            maxLength={255}
          />
        </label>
      </div>

      {form.requesterType ===
        'PROFESSIONAL' && (
        <div
          className="
            mt-7
            rounded-2xl
            border
            border-[#c96f4a]/20
            bg-[#c96f4a]/5
            p-4
            sm:p-6
          "
        >
          <h2
            className="
              text-base
              font-extrabold
              text-slate-950
            "
          >
            Informations sur
            l’entreprise
          </h2>

          <div
            className="
              mt-5
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <label className="field-label">
              Nom de l’entreprise

              <input
                className="field-input"
                autoComplete="organization"
                value={
                  form.companyName
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'companyName',
                    event.target
                      .value,
                  )
                }
                required
                minLength={2}
                maxLength={255}
              />
            </label>

            <label className="field-label">
              Secteur d’activité

              <input
                className="field-input"
                value={
                  form.businessSector
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'businessSector',
                    event.target
                      .value,
                  )
                }
                required
                minLength={2}
                maxLength={255}
              />
            </label>

            <label className="field-label sm:col-span-2">
              Nombre d’années
              d’activité

              <input
                className="field-input"
                type="number"
                inputMode="numeric"
                min={0}
                max={200}
                step={1}
                value={
                  form.yearsInBusiness
                }
                onChange={(
                  event,
                ) =>
                  update(
                    'yearsInBusiness',
                    event.target
                      .value,
                  )
                }
                required
              />
            </label>
          </div>
        </div>
      )}

      <label
        className="
          field-label
          mt-7
        "
      >
        Description de la demande

        <textarea
          className="
            field-input
            min-h-44
            resize-y
            py-3
          "
          value={
            form.description
          }
          onChange={(
            event,
          ) =>
            update(
              'description',
              event.target
                .value,
            )
          }
          required
          minLength={10}
          maxLength={5000}
          placeholder="Décrivez votre besoin avec suffisamment de détails pour nous permettre de vous orienter correctement."
        />
      </label>

      {error && (
        <p
          role="alert"
          className="
            mt-5
            rounded-xl
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-800
          "
        >
          {error}
        </p>
      )}

      {sent && (
        <p
          role="status"
          className="
            mt-5
            flex
            items-start
            gap-2
            rounded-xl
            bg-emerald-50
            px-4
            py-3
            text-sm
            leading-6
            text-emerald-800
          "
        >
          <CheckCircle2
            size={18}
            className="
              mt-0.5
              shrink-0
            "
          />

          Votre demande a bien
          été envoyée. Elle sera
          prise en charge depuis
          l’espace
          d’administration.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          mt-7
          inline-flex
          min-h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-md
          bg-[#c96f4a]
          px-6
          font-extrabold
          !text-white
          transition
          hover:bg-[#a95235]
          hover:!text-white
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:w-auto
        "
      >
        {loading && (
          <Loader2
            size={18}
            className="animate-spin"
          />
        )}

        Envoyer la demande
      </button>
    </form>
  );
}