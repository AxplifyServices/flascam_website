import {
  apiFetch,
} from '@/lib/api';

import type {
  CreateNonVotingAdherentPayload,
  CreateNonVotingAdherentResponse,
  NonVotingAdherent,
  NonVotingAdherentFormState,
  NonVotingAdherentsFilters,
  NonVotingAdherentsListResponse,
  NonVotingRegistrationConfig,
  RegisterNonVotingAdherentPayload,
  RegisterNonVotingAdherentResponse,
  UpdateNonVotingAdherentPayload,
} from '@/types/non-voting-adherents';

async function publicFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response =
    await apiFetch(
      path,
      {
        cache:
          'no-store',

        ...init,
      },
    );

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

  return await response.json() as T;
}

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
    response.status ===
    401
  ) {
    const refreshResponse =
      await apiFetch(
        '/auth/refresh',
        {
          method:
            'POST',
        },
      );

    if (
      refreshResponse.ok
    ) {
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
    response.status ===
    204
  ) {
    return undefined as T;
  }

  return await response.json() as T;
}

function emptyToUndefined(
  value: string,
): string | undefined {
  const normalized =
    value.trim();

  return normalized
    ? normalized
    : undefined;
}

export function createNonVotingAdherentPayload(
  form:
    NonVotingAdherentFormState,
): CreateNonVotingAdherentPayload {
  const isWafacash =
    form.depositPaymentMethod ===
    'WAFACASH';

  return {
    firstName:
      form.firstName.trim(),

    lastName:
      form.lastName.trim(),

    phone:
      form.phone.trim(),

    email:
      form.email
        .trim()
        .toLowerCase(),

    city:
      form.city.trim(),

    depositPaymentMethod:
      form.depositPaymentMethod,

    ...(isWafacash
      ? {
          wafacashReference:
            emptyToUndefined(
              form.wafacashReference,
            ),
        }
      : {}),

    ...(
      !form.generateTemporaryPassword
        ? {
            temporaryPassword:
              emptyToUndefined(
                form.temporaryPassword,
              ),
          }
        : {}
    ),
  };
}

export async function getAdminNonVotingAdherents(
  filters:
    NonVotingAdherentsFilters = {},
) {
  const query =
    new URLSearchParams();

  if (
    filters.page
  ) {
    query.set(
      'page',
      String(
        filters.page,
      ),
    );
  }

  if (
    filters.limit
  ) {
    query.set(
      'limit',
      String(
        filters.limit,
      ),
    );
  }

  if (
    filters.search?.trim()
  ) {
    query.set(
      'search',
      filters.search.trim(),
    );
  }

  if (
    filters.status
  ) {
    query.set(
      'status',
      filters.status,
    );
  }

  const suffix =
    query.size > 0
      ? `?${query.toString()}`
      : '';

  return await authenticatedFetch<
    NonVotingAdherentsListResponse
  >(
    `/non-voting-adherents/admin${suffix}`,
  );
}

export async function getAdminNonVotingAdherent(
  id: string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}`,
  );
}

export async function getMyNonVotingAdherentProfile() {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    '/non-voting-adherents/me',
  );
}

export async function createAdminNonVotingAdherent(
  payload:
    CreateNonVotingAdherentPayload,
) {
  return await authenticatedFetch<
    CreateNonVotingAdherentResponse
  >(
    '/non-voting-adherents/admin',
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

export async function updateAdminNonVotingAdherent(
  id: string,
  payload:
    UpdateNonVotingAdherentPayload,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}`,
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

export async function submitMyWafacashReference(
  wafacashReference:
    string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    '/non-voting-adherents/me/wafacash-reference',
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          wafacashReference:
            wafacashReference.trim(),
        }),
    },
  );
}

export async function approveNonVotingAdherentWafacash(
  id: string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}/wafacash/approve`,
    {
      method:
        'PATCH',
    },
  );
}

export async function rejectNonVotingAdherentWafacash(
  id: string,
  reason: string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}/wafacash/reject`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          reason:
            reason.trim(),
        }),
    },
  );
}

export async function suspendNonVotingAdherent(
  id: string,
  reason: string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}/suspend`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          reason:
            reason.trim(),
        }),
    },
  );
}

export async function reactivateNonVotingAdherent(
  id: string,
) {
  return await authenticatedFetch<
    NonVotingAdherent
  >(
    `/non-voting-adherents/admin/${encodeURIComponent(
      id,
    )}/reactivate`,
    {
      method:
        'PATCH',
    },
  );
}

export async function getNonVotingRegistrationConfig() {
  return await publicFetch<
    NonVotingRegistrationConfig
  >(
    '/non-voting-adherents/registration-config',
  );
}

export async function registerNonVotingAdherent(
  payload:
    RegisterNonVotingAdherentPayload,
) {
  return await publicFetch<
    RegisterNonVotingAdherentResponse
  >(
    '/non-voting-adherents/register',
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