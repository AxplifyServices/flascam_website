'use client';

import {
  useCallback,
} from 'react';

import {
  ComposableMap,
  createCoordinates,
  Marker,
} from '@vnedyalk0v/react19-simple-maps';

import {
  MapPin,
  MousePointerClick,
} from 'lucide-react';

import {
  MoroccoRegionsLayer,
} from '@/components/maps/morocco-regions-layer';

type AssociationMapPositionEditorProps = {
  associationName: string;
  latitude: string;
  longitude: string;
  disabled?: boolean;

  onChange: (
    latitude: string,
    longitude: string,
  ) => void;
};

const MOROCCO_CENTER =
  createCoordinates(
    -7.8,
    28.3,
  );

const MOROCCO_PROJECTION = {
  center:
    MOROCCO_CENTER,

  scale:
    1850,
};

export function AssociationMapPositionEditor({
  associationName,
  latitude,
  longitude,
  disabled = false,
  onChange,
}: AssociationMapPositionEditorProps) {
  const numericLatitude =
    Number(latitude);

  const numericLongitude =
    Number(longitude);

  const hasValidPosition =
    latitude.trim() !== '' &&
    longitude.trim() !== '' &&
    Number.isFinite(
      numericLatitude,
    ) &&
    Number.isFinite(
      numericLongitude,
    ) &&
    numericLatitude >= -90 &&
    numericLatitude <= 90 &&
    numericLongitude >= -180 &&
    numericLongitude <= 180;

  const selectCoordinate =
    useCallback(
      (
        nextLatitude: number,
        nextLongitude: number,
      ) => {
        onChange(
          nextLatitude.toFixed(6),
          nextLongitude.toFixed(6),
        );
      },
      [onChange],
    );

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--flascam-border)] bg-gradient-to-b from-[#eef6fb] to-[#ffffff] shadow-sm">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={
            MOROCCO_PROJECTION
          }
          width={680}
          height={720}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Carte interactive du Maroc pour positionner l’association"
          className={[
            'block h-[500px] w-full sm:h-[600px] xl:h-[650px]',
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-crosshair',
          ].join(' ')}
        >
          <MoroccoRegionsLayer
            variant="admin"
            disabled={disabled}
            onCoordinateSelect={
              selectCoordinate
            }
          />

          {hasValidPosition && (
            <Marker
              coordinates={createCoordinates(
                numericLongitude,
                numericLatitude,
              )}
            >
              <circle
                r={14}
                fill="rgba(201,111,74,0.22)"
                pointerEvents="none"
              />

              <circle
                r={8}
                fill="#c96f4a"
                stroke="#ffffff"
                strokeWidth={2.5}
                pointerEvents="none"
              />

              <MapPin
                x={-5}
                y={-5}
                width={10}
                height={10}
                color="#ffffff"
                aria-hidden="true"
                className="pointer-events-none"
              />

              <title>
                {associationName ||
                  'Association'}
              </title>
            </Marker>
          )}
        </ComposableMap>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-[#07355d] shadow-sm backdrop-blur">
            <span className="h-3 w-4 rounded-sm border border-[#9fbfd2] bg-[#d7e9f4]" />

            Régions du Maroc
          </span>

          <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-[#07355d] shadow-sm backdrop-blur">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-[#c96f4a] shadow" />

            Association
          </span>
        </div>

        {!hasValidPosition && (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-white/70 bg-white/95 p-4 text-center shadow-lg backdrop-blur sm:inset-x-auto sm:left-1/2 sm:w-[22rem] sm:-translate-x-1/2">
            <MousePointerClick
              size={22}
              aria-hidden="true"
              className="mx-auto text-[var(--flascam-blue)]"
            />

            <p className="mt-2 text-sm font-extrabold text-slate-800">
              Cliquez directement sur une région pour positionner l’association.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-[var(--flascam-slate)]">
        Le marqueur peut être placé à n’importe quel emplacement situé à
        l’intérieur des frontières affichées du Maroc.
      </p>
    </div>
  );
}