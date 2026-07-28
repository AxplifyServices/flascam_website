'use client';

import type {
  MouseEvent as ReactMouseEvent,
} from 'react';

import {
  ComposableMap,
  createCoordinates,
  Geography,
  Marker,
  useMapContext,
  ZoomableGroup,
} from '@vnedyalk0v/react19-simple-maps';

import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from 'geojson';

import {
  MapPin,
  MousePointerClick,
} from 'lucide-react';

import moroccoRegionsGeoJson from '@/data/maps/morocco-regions.json';

const MOROCCO_REGIONS =
  moroccoRegionsGeoJson as unknown as FeatureCollection<
    Geometry,
    GeoJsonProperties
  >;

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

type MapClickLayerProps = {
  disabled: boolean;
  onChange: (
    latitude: string,
    longitude: string,
  ) => void;
};

type MapCity = {
  name: string;
  latitude: number;
  longitude: number;
  labelX?: number;
  labelY?: number;
};

const MOROCCO_CENTER =
  createCoordinates(-7.8, 28.3);

const REGION_COLORS = [
  '#d9eaf4',
  '#e8e0f2',
  '#f3e1dc',
  '#e0eedf',
  '#f2ebd7',
  '#dce9ef',
  '#eadfeb',
  '#e4ecd9',
  '#f1e2cc',
  '#dbe7f2',
  '#eee2e8',
  '#dcece9',
] as const;  

const REGION_LABELS = [
  {
    label: 'Tanger-Tétouan-Al Hoceïma',
    latitude: 35.18,
    longitude: -5.25,
  },
  {
    label: 'L’Oriental',
    latitude: 34.1,
    longitude: -2.75,
  },
  {
    label: 'Fès-Meknès',
    latitude: 33.75,
    longitude: -4.8,
  },
  {
    label: 'Rabat-Salé-Kénitra',
    latitude: 34.25,
    longitude: -6.3,
  },
  {
    label: 'Béni Mellal-Khénifra',
    latitude: 32.35,
    longitude: -6.1,
  },
  {
    label: 'Casablanca-Settat',
    latitude: 33.05,
    longitude: -7.65,
  },
  {
    label: 'Marrakech-Safi',
    latitude: 31.65,
    longitude: -8.35,
  },
  {
    label: 'Drâa-Tafilalet',
    latitude: 31.15,
    longitude: -5.2,
  },
  {
    label: 'Souss-Massa',
    latitude: 29.75,
    longitude: -9,
  },
  {
    label: 'Guelmim-Oued Noun',
    latitude: 28.55,
    longitude: -9.85,
  },
  {
    label: 'Laâyoune-Sakia El Hamra',
    latitude: 26.55,
    longitude: -12.3,
  },
  {
    label: 'Dakhla-Oued Ed-Dahab',
    latitude: 23.25,
    longitude: -15.1,
  },
] as const;

const MOROCCO_CITIES: MapCity[] = [
  {
    name: 'Tanger',
    latitude: 35.7595,
    longitude: -5.834,
    labelX: 7,
    labelY: -5,
  },
  {
    name: 'Tétouan',
    latitude: 35.5785,
    longitude: -5.3684,
    labelX: 7,
    labelY: 8,
  },
  {
    name: 'Al Hoceïma',
    latitude: 35.2517,
    longitude: -3.9372,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Oujda',
    latitude: 34.6814,
    longitude: -1.9086,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Nador',
    latitude: 35.1681,
    longitude: -2.9335,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Fès',
    latitude: 34.0331,
    longitude: -5.0003,
    labelX: 7,
    labelY: -5,
  },
  {
    name: 'Meknès',
    latitude: 33.8935,
    longitude: -5.5473,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Kénitra',
    latitude: 34.261,
    longitude: -6.5802,
    labelX: -7,
    labelY: -5,
  },
  {
    name: 'Rabat',
    latitude: 34.0209,
    longitude: -6.8416,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Casablanca',
    latitude: 33.5731,
    longitude: -7.5898,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'El Jadida',
    latitude: 33.2316,
    longitude: -8.5007,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Settat',
    latitude: 33.001,
    longitude: -7.6166,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Béni Mellal',
    latitude: 32.3373,
    longitude: -6.3498,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Khénifra',
    latitude: 32.9391,
    longitude: -5.6675,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Marrakech',
    latitude: 31.6295,
    longitude: -7.9811,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Safi',
    latitude: 32.2994,
    longitude: -9.2372,
    labelX: -7,
    labelY: -4,
  },
  {
    name: 'Ouarzazate',
    latitude: 30.9335,
    longitude: -6.937,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Errachidia',
    latitude: 31.9314,
    longitude: -4.4244,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Agadir',
    latitude: 30.4278,
    longitude: -9.5981,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Taroudant',
    latitude: 30.4703,
    longitude: -8.8769,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Guelmim',
    latitude: 28.9869,
    longitude: -10.0574,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Tan-Tan',
    latitude: 28.438,
    longitude: -11.1032,
    labelX: -7,
    labelY: 10,
  },
  {
    name: 'Laâyoune',
    latitude: 27.1253,
    longitude: -13.1625,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Boujdour',
    latitude: 26.1264,
    longitude: -14.484,
    labelX: 7,
    labelY: -4,
  },
  {
    name: 'Dakhla',
    latitude: 23.6848,
    longitude: -15.957,
    labelX: 7,
    labelY: -4,
  },
];

function formatCoordinate(
  value: number,
) {
  return value.toFixed(6);
}

function getRegionName(
  geography: {
    properties?: {
      shapeName?: unknown;
      name?: unknown;
      nom_fr?: unknown;
    } | null;
  },
) {
  const properties =
    geography.properties;

  const value =
    properties?.shapeName ??
    properties?.nom_fr ??
    properties?.name;

  return typeof value === 'string'
    ? value.trim()
    : '';
}

function RegionLabels() {
  return (
    <>
      {REGION_LABELS.map(
        (region) => (
          <Marker
            key={region.label}
            coordinates={createCoordinates(
              region.longitude,
              region.latitude,
            )}
          >
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={4.6}
              fontWeight={750}
              fill="#23435c"
              stroke="#ffffff"
              strokeWidth={1.4}
              paintOrder="stroke"
              strokeLinejoin="round"
              pointerEvents="none"
              aria-hidden="true"
            >
              {region.label}
            </text>
          </Marker>
        ),
      )}
    </>
  );
}

function MapClickLayer({
  disabled,
  onChange,
}: MapClickLayerProps) {
  const {
    projection,
    width,
    height,
  } = useMapContext();

  function handleClick(
    event: ReactMouseEvent<SVGRectElement>,
  ) {
    if (disabled) {
      return;
    }

    const target =
      event.currentTarget;

    const svg =
      target.ownerSVGElement;

    if (!svg) {
      return;
    }

    const screenMatrix =
      target.getScreenCTM();

    if (!screenMatrix) {
      return;
    }

    const screenPoint =
      svg.createSVGPoint();

    screenPoint.x =
      event.clientX;

    screenPoint.y =
      event.clientY;

    const mapPoint =
      screenPoint.matrixTransform(
        screenMatrix.inverse(),
      );

    const invertedCoordinates =
      projection.invert?.([
        mapPoint.x,
        mapPoint.y,
      ]);

    if (!invertedCoordinates) {
      return;
    }

    const [
      nextLongitude,
      nextLatitude,
    ] = invertedCoordinates;

    if (
      !Number.isFinite(
        nextLatitude,
      ) ||
      !Number.isFinite(
        nextLongitude,
      )
    ) {
      return;
    }

    if (
      nextLatitude < -90 ||
      nextLatitude > 90 ||
      nextLongitude < -180 ||
      nextLongitude > 180
    ) {
      return;
    }

    onChange(
      formatCoordinate(
        nextLatitude,
      ),
      formatCoordinate(
        nextLongitude,
      ),
    );
  }

  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill="transparent"
      pointerEvents={
        disabled
          ? 'none'
          : 'all'
      }
      onClick={handleClick}
      aria-label="Cliquer pour placer l’association sur la carte"
    />
  );
}

function CityLabels() {
  return (
    <>
      {MOROCCO_CITIES.map(
        (city) => {
          const labelX =
            city.labelX ?? 7;

          const labelY =
            city.labelY ?? -4;

          const textAnchor =
            labelX < 0
              ? 'end'
              : 'start';

          return (
            <Marker
              key={city.name}
              coordinates={createCoordinates(
                city.longitude,
                city.latitude,
              )}
            >
              <g
                pointerEvents="none"
                aria-hidden="true"
              >
<circle
  r={1.25}
  fill="#ffffff"
  stroke="#c96f4a"
  strokeWidth={0.55}
/>

<circle
  r={0.4}
  fill="#c96f4a"
/>

                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={
                    textAnchor
                  }
fontSize={4.2}
fontWeight={700}
fill="#29445a"
stroke="#ffffff"
strokeWidth={1.2}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {city.name}
                </text>
              </g>
            </Marker>
          );
        },
      )}
    </>
  );
}

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

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--flascam-border)] bg-[#eaf4fa]">
        <ComposableMap
          projection="geoMercator"
projectionConfig={{
  center: MOROCCO_CENTER,
  scale: 1850,
}}
width={680}
height={720}
          className={[
            'h-auto w-full',
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-crosshair',
          ].join(' ')}
          aria-label="Sélection de la position de l’association sur la carte du Maroc"
        >
<ZoomableGroup
  center={MOROCCO_CENTER}
  zoom={1}
  minZoom={1}
  maxZoom={4}
>

<g aria-label="Régions administratives du Maroc">
  {MOROCCO_REGIONS.features.map(
    (
      geography,
      index,
    ) => {
      const regionName =
        getRegionName(
          geography,
        );

      const shapeId =
        geography.properties
          ?.shapeID;

      const baseColor =
        REGION_COLORS[
          index %
            REGION_COLORS.length
        ];

      return (
        <Geography
          key={
            typeof shapeId ===
            'string'
              ? shapeId
              : regionName ||
                `morocco-region-${index}`
          }
          geography={
            geography
          }
          fill={baseColor}
          stroke="#ffffff"
          strokeWidth={1.15}
          vectorEffect="non-scaling-stroke"
          style={{
            default: {
              fill: baseColor,
              outline: 'none',
            },

            hover: {
              fill: '#c8deeb',
              outline: 'none',
              cursor: disabled
                ? 'not-allowed'
                : 'crosshair',
            },

            pressed: {
              fill: '#b8d4e4',
              outline: 'none',
            },
          }}
        >
          <title>
            {regionName ||
              'Région du Maroc'}
          </title>
        </Geography>
      );
    },
  )}
</g>

  <RegionLabels />

  <CityLabels />

  <MapClickLayer
    disabled={disabled}
    onChange={onChange}
  />

  {hasValidPosition && (
    <Marker
      coordinates={createCoordinates(
        numericLongitude,
        numericLatitude,
      )}
    >
      <circle
        r={10}
        fill="rgba(201, 111, 74, 0.2)"
        pointerEvents="none"
      />

      <circle
        r={7}
        fill="#c96f4a"
        stroke="#ffffff"
        strokeWidth={2}
        pointerEvents="none"
      />

      <MapPin
        x={-4.5}
        y={-4.5}
        width={9}
        height={9}
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
</ZoomableGroup>
        </ComposableMap>

        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-bold text-[#07355d] shadow-sm backdrop-blur">
            <span className="h-3 w-4 rounded-sm border border-white bg-[#d9eaf4] shadow-[inset_0_0_0_1px_#9fbfd2]" />

            Région
          </span>

          <span className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-bold text-[#07355d] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full border border-[#c96f4a] bg-white" />

            Ville
          </span>

          <span className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-bold text-[#07355d] shadow-sm backdrop-blur">
            <span className="h-3 w-3 rounded-full border-2 border-white bg-[#c96f4a] shadow" />

            Association
          </span>
        </div>

        {!hasValidPosition && (
          <div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-xl bg-white/95 p-4 text-center shadow-lg backdrop-blur">
            <MousePointerClick
              size={22}
              aria-hidden="true"
              className="mx-auto text-[var(--flascam-blue)]"
            />

            <p className="mt-2 text-sm font-bold text-slate-800">
              Cliquez sur la carte pour placer l’association.
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Utilisez les noms des régions et des villes comme points de
              repère.
            </p>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-[var(--flascam-slate)]">
        Cliquez à l’emplacement correspondant au siège ou à la zone principale
        de l’association. Les régions et les villes servent de repères visuels.
        La carte peut être déplacée et agrandie.
      </p>
    </div>
  );
}