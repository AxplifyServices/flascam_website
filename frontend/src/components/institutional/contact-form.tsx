'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import {
  apiFetch,
} from '@/lib/api';

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export function ContactForm() {
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

  function update(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
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

    try {
      const response =
        await apiFetch(
          '/institutional/contact',
          {
            method: 'POST',
            body: JSON.stringify(
              form,
            ),
          },
        );

      if (!response.ok) {
        throw new Error();
      }

      setForm(initialState);
      setSent(true);
    } catch {
      setError(
        'Votre message n’a pas pu être envoyé. Vérifiez les informations saisies puis réessayez.',
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
        bg-white
        p-5
        shadow-[0_30px_90px_rgba(5,24,44,0.16)]
        sm:p-8
      "
    >
      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
        "
      >
        <label className="field-label">
          Nom complet

          <input
            className="field-input"
            value={form.fullName}
            onChange={(event) =>
              update(
                'fullName',
                event.target.value,
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
            value={form.email}
            onChange={(event) =>
              update(
                'email',
                event.target.value,
              )
            }
            required
          />
        </label>

        <label className="field-label">
          Téléphone

          <input
            className="field-input"
            type="tel"
            value={form.phone}
            onChange={(event) =>
              update(
                'phone',
                event.target.value,
              )
            }
          />
        </label>

        <label className="field-label">
          Objet

          <input
            className="field-input"
            value={form.subject}
            onChange={(event) =>
              update(
                'subject',
                event.target.value,
              )
            }
            required
            minLength={3}
          />
        </label>
      </div>

      <label
        className="
          field-label
          mt-5
        "
      >
        Message

        <textarea
          className="
            field-input
            min-h-36
            resize-y
            py-3
          "
          value={form.message}
          onChange={(event) =>
            update(
              'message',
              event.target.value,
            )
          }
          required
          minLength={10}
          maxLength={5000}
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
            items-center
            gap-2
            rounded-xl
            bg-emerald-50
            px-4
            py-3
            text-sm
            text-emerald-800
          "
        >
          <CheckCircle2
            size={18}
          />

          Votre message a bien
          été envoyé.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="
          mt-6
          inline-flex
          h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-full
          bg-[var(--navy)]
          px-6
          font-semibold
          text-white
          transition
          hover:bg-[var(--navy-light)]
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

        Envoyer le message
      </button>
    </form>
  );
}