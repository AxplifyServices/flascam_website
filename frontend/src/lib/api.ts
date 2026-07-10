export const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api';

export async function apiFetch(
  path: string,
  init: RequestInit = {},
) {
  const isFormData =
    init.body instanceof FormData;

  return fetch(
    `${API_URL}${path}`,
    {
      ...init,
      credentials: 'include',
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
}