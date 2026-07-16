const browserApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  '/api';

const configuredServerApiUrl =
  process.env.SERVER_API_URL?.trim();

const serverApiUrl =
  configuredServerApiUrl ||
  (
    browserApiUrl.startsWith(
      'http://',
    ) ||
    browserApiUrl.startsWith(
      'https://',
    )
      ? browserApiUrl
      : 'http://localhost:3000/api'
  );

function removeTrailingSlash(
  value: string,
) {
  return value.replace(
    /\/+$/,
    '',
  );
}

export const API_URL =
  removeTrailingSlash(
    typeof window ===
      'undefined'
      ? serverApiUrl
      : browserApiUrl,
  );

export async function apiFetch(
  path: string,
  init: RequestInit = {},
) {
  const normalizedPath =
    path.startsWith('/')
      ? path
      : `/${path}`;

  const isFormData =
    typeof FormData !==
      'undefined' &&
    init.body instanceof
      FormData;

  const url =
    `${API_URL}${normalizedPath}`;

  const response =
    await fetch(
      url,
      {
        ...init,

        credentials:
          'include',

        headers: {
          ...(isFormData
            ? {}
            : {
                'Content-Type':
                  'application/json',
              }),

          ...init.headers,
        },
      },
    );

  return response;
}