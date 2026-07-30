'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useParams,
} from 'next/navigation';

import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
} from 'lucide-react';

import {
  MarketplaceListingForm,
} from '@/components/admin/marketplace-listing-form';

import {
  getMyMarketplaceListingById,
} from '@/lib/marketplace-api';

import type {
  MarketplaceListing,
} from '@/types/marketplace';

export default function EditMarketplaceListingPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const listingId =
    typeof params.id ===
    'string'
      ? params.id
      : '';

  const [
    listing,
    setListing,
  ] = useState<
    MarketplaceListing | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const loadListing =
    useCallback(
      async () => {
        if (!listingId) {
          setError(
            'Identifiant de l’annonce invalide.',
          );

          setLoading(
            false,
          );

          return;
        }

        setLoading(
          true,
        );

        setError(
          null,
        );

        try {
          const response =
            await getMyMarketplaceListingById(
              listingId,
            );

          if (
            response.status !==
              'DRAFT' &&
            response.status !==
              'REJECTED'
          ) {
            setError(
              'Cette annonce ne peut plus être modifiée dans son état actuel.',
            );

            return;
          }

          setListing(
            response,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Impossible de charger cette annonce.',
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        listingId,
      ],
    );

  useEffect(() => {
    void loadListing();
  }, [
    loadListing,
  ]);

  if (loading) {
    return (
      <div
        className="
          grid
          min-h-[500px]
          place-items-center
        "
      >
        <div
          className="
            text-center
            text-slate-600
          "
        >
          <LoaderCircle
            size={38}
            className="
              mx-auto
              animate-spin
              text-[var(--flascam-blue)]
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-bold
            "
          >
            Chargement du brouillon…
          </p>
        </div>
      </div>
    );
  }

  if (
    error ||
    !listing
  ) {
    return (
      <div
        className="
          mx-auto
          max-w-3xl
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-8
          text-center
        "
      >
        <AlertCircle
          size={38}
          className="
            mx-auto
            text-red-600
          "
        />

        <h1
          className="
            mt-4
            text-xl
            font-black
            text-red-800
          "
        >
          Modification impossible
        </h1>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-red-700
          "
        >
          {error ||
            'Cette annonce est introuvable.'}
        </p>

        <Link
          href={
            listingId
              ? `/admin/my-marketplace-listings/${listingId}`
              : '/admin/my-marketplace-listings'
          }
          className="
            mt-6
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[var(--flascam-blue)]
            px-5
            text-sm
            font-bold
            text-white
          "
        >
          <ArrowLeft
            size={18}
          />

          Retour
        </Link>
      </div>
    );
  }

  return (
    <MarketplaceListingForm
      mode="edit"
      initialListing={
        listing
      }
    />
  );
}