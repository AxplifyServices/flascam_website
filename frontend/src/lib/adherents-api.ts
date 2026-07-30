import {
  apiFetch,
} from '@/lib/api';

import type {
  Adherent,
  AdherentFormState,
  CreateAdherentPayload,
  UpdateAdherentPayload,
  UpdateAdherentStatusPayload,
} from '@/types/adherents';

async function authenticatedFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response =
    await apiFetch(
      path,
      {
        cache:
          'no-store',

        ...init,
      },
    );

  if (
    response.status === 401
  ) {
    await apiFetch(
      '/auth/refresh',
      {
        method:
          'POST',
      },
    );

    response =
      await apiFetch(
        path,
        {
          cache:
            'no-store',

          ...init,
        },
      );
  }

  if (!response.ok) {
    const body =
      await response
        .json()
        .catch(
          () => null,
        );

    const message =
      Array.isArray(
        body?.message,
      )
        ? body.message.join(
            ' ',
          )
        : body?.message;

    throw new Error(
      message ||
        'L’action demandée n’a pas pu être réalisée.',
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return await response.json() as T;
}

function emptyToUndefined(
  value: string,
) {
  const normalized =
    value.trim();

  return normalized
    ? normalized
    : undefined;
}

export function createAdherentPayload(
  form: AdherentFormState,
  includeAssociation:
    boolean,
): CreateAdherentPayload {
  return {
    ...(includeAssociation
      ? {
          regionalAssociationId:
            emptyToUndefined(
              form.regionalAssociationId,
            ),
        }
      : {}),

    displayName:
      form.displayName.trim(),

    legalName:
      emptyToUndefined(
        form.legalName,
      ),

    identifierType:
      form.identifierType ||
      undefined,

    identifierValue:
      emptyToUndefined(
        form.identifierValue,
      ),

    address:
      emptyToUndefined(
        form.address,
      ),

    city:
      emptyToUndefined(
        form.city,
      ),

    postalCode:
      emptyToUndefined(
        form.postalCode,
      ),

    notes:
      emptyToUndefined(
        form.notes,
      ),

    firstName:
      form.firstName.trim(),

    lastName:
      form.lastName.trim(),

    email:
      form.email
        .trim()
        .toLowerCase(),

    phone:
      emptyToUndefined(
        form.phone,
      ),

    /*
     * Le mot de passe est directement celui saisi
     * par l’association ou par FLASCAM.
     */
    password:
      form.password,

    ...(includeAssociation
      ? {
          approveImmediately:
            form.approveImmediately,
        }
      : {}),
  };
}

export async function getAdminAdherents(
  status?: string,
) {
  const query =
    status
      ? `?status=${encodeURIComponent(
          status,
        )}`
      : '';

  return await authenticatedFetch<
    Adherent[]
  >(
    `/adherents/admin${query}`,
  );
}

export async function getAssociationAdherents(
  status?: string,
) {
  const query =
    status
      ? `?status=${encodeURIComponent(
          status,
        )}`
      : '';

  return await authenticatedFetch<
    Adherent[]
  >(
    `/adherents/association${query}`,
  );
}

export async function getAdherent(
  id: string,
) {
  return await authenticatedFetch<
    Adherent
  >(
    `/adherents/${id}`,
  );
}

export async function createAdminAdherent(
  payload:
    CreateAdherentPayload,
) {
  return await authenticatedFetch<
    Adherent
  >(
    '/adherents/admin',
    {
      method:
        'POST',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function createAssociationAdherent(
  payload:
    CreateAdherentPayload,
) {
  /*
   * Le backend ignore de toute manière
   * regionalAssociationId et approveImmediately
   * sur cette route.
   *
   * On ne les transmet pas non plus côté frontend.
   */
  const {
    regionalAssociationId:
      _regionalAssociationId,

    approveImmediately:
      _approveImmediately,

    ...safePayload
  } = payload;

  return await authenticatedFetch<
    Adherent
  >(
    '/adherents/association',
    {
      method:
        'POST',

      body:
        JSON.stringify(
          safePayload,
        ),
    },
  );
}

export async function updateAdherent(
  id: string,
  payload:
    UpdateAdherentPayload,
) {
  return await authenticatedFetch<
    Adherent
  >(
    `/adherents/${id}`,
    {
      method:
        'PUT',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function updateAdherentStatus(
  id: string,
  payload:
    UpdateAdherentStatusPayload,
) {
  return await authenticatedFetch<
    Adherent
  >(
    `/adherents/${id}/status`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}