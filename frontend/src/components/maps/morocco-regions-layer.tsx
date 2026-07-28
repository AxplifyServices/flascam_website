'use client';

import {
  memo,
  useCallback,
  useEffect,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

import {
  Geographies,
  Geography,
  useMapContext,
} from '@vnedyalk0v/react19-simple-maps';

import type {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';

const MOROCCO_MAP_URL =
  '/maps/morocco-regions.v1.geojson';

type MoroccoMapData = FeatureCollection<
  Geometry,
  GeoJsonProperties
>;

type MoroccoRegionsLayerProps = {
  variant?: 'admin' | 'public';
  disabled?: boolean;

  onCoordinateSelect?: (
    latitude: number,
    longitude: number,
  ) => void;
};

let cachedMoroccoMap:
  | MoroccoMapData
  | null = null;

let pendingMoroccoMap:
  | Promise<MoroccoMapData>
  | null = null;

const ADMIN_REGION_COLORS = [
  '#d7e9f4',
  '#e3edf5',
  '#d9e8ef',
  '#e8edf4',
  '#dcebf2',
  '#e2e9f2',
  '#d5e6ef',
  '#e6edf3',
  '#daeaf3',
  '#e1eaf1',
  '#d9e7f0',
  '#e5ecf3',
] as const;

const PUBLIC_REGION_STYLE = {
  default: {
    fill: '#0f5f9f',
    outline: 'none',
  },

  hover: {
    fill: '#1977bb',
    outline: 'none',
  },

  pressed: {
    fill: '#c96f4a',
    outline: 'none',
  },

  focused: {
    fill: '#1977bb',
    outline: 'none',
  },
};

const ADMIN_REGION_STYLES =
  ADMIN_REGION_COLORS.map(
    (fill) => ({
      default: {
        fill,
        outline: 'none',
      },

      hover: {
        fill: '#b9d8e9',
        outline: 'none',
        cursor: 'crosshair',
      },

      pressed: {
        fill: '#9fc8df',
        outline: 'none',
      },

      focused: {
        fill: '#b9d8e9',
        outline: 'none',
      },
    }),
  );

async function loadMoroccoMap():
  Promise<MoroccoMapData> {
  if (cachedMoroccoMap) {
    return cachedMoroccoMap;
  }

  if (!pendingMoroccoMap) {
    pendingMoroccoMap = fetch(
      MOROCCO_MAP_URL,
      {
        credentials: 'same-origin',
        cache: 'force-cache',
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Impossible de charger la carte du Maroc : HTTP ${response.status}.`,
          );
        }

        return await response.json();
      })
      .then((data: unknown) => {
        if (
          typeof data !== 'object' ||
          data === null ||
          !('type' in data) ||
          data.type !==
            'FeatureCollection' ||
          !('features' in data) ||
          !Array.isArray(
            data.features,
          )
        ) {
          throw new Error(
            'Le fichier cartographique du Maroc est invalide.',
          );
        }

        cachedMoroccoMap =
          data as MoroccoMapData;

        return cachedMoroccoMap;
      })
      .catch((error) => {
        pendingMoroccoMap = null;
        throw error;
      });
  }

  return pendingMoroccoMap;
}

function getRegionName(
  properties:
    | GeoJsonProperties
    | null
    | undefined,
) {
  const name =
    properties?.shapeName ??
    properties?.name;

  return typeof name === 'string' &&
    name.trim()
    ? name.trim()
    : 'Région du Maroc';
}

function roundCoordinate(
  value: number,
) {
  return Number(
    value.toFixed(6),
  );
}

function MapMessage({
  children,
  error = false,
}: {
  children: string;
  error?: boolean;
}) {
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
      fill={
        error
          ? '#b91c1c'
          : '#536273'
      }
      fontSize={14}
      fontWeight={700}
    >
      {children}
    </text>
  );
}

function MoroccoRegionsLayerComponent({
  variant = 'public',
  disabled = false,
  onCoordinateSelect,
}: MoroccoRegionsLayerProps) {
  const {
    projection,
  } = useMapContext();

  const [
    geography,
    setGeography,
  ] = useState<MoroccoMapData | null>(
    () => cachedMoroccoMap,
  );

  const [
    loadError,
    setLoadError,
  ] = useState('');

  useEffect(() => {
    if (geography) {
      return;
    }

    let isMounted = true;

    void loadMoroccoMap()
      .then((mapData) => {
        if (!isMounted) {
          return;
        }

        setGeography(mapData);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error(
          '[MoroccoRegionsLayer] Chargement impossible',
          error,
        );

        setLoadError(
          'Carte du Maroc indisponible',
        );
      });

    return () => {
      isMounted = false;
    };
  }, [geography]);

  const handleRegionClick =
    useCallback(
      (
        event:
          ReactMouseEvent<SVGPathElement>,
      ) => {
        if (
          disabled ||
          !onCoordinateSelect
        ) {
          return;
        }

        const pathElement =
          event.currentTarget;

        const svg =
          pathElement.ownerSVGElement;

        const matrix =
          pathElement.getScreenCTM();

        if (
          !svg ||
          !matrix ||
          !projection.invert
        ) {
          return;
        }

        const point =
          svg.createSVGPoint();

        point.x =
          event.clientX;

        point.y =
          event.clientY;

        const projectedPoint =
          point.matrixTransform(
            matrix.inverse(),
          );

        const coordinates =
          projection.invert([
            projectedPoint.x,
            projectedPoint.y,
          ]);

        if (!coordinates) {
          return;
        }

        const [
          longitude,
          latitude,
        ] = coordinates;

        if (
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          )
        ) {
          return;
        }

        onCoordinateSelect(
          roundCoordinate(
            latitude,
          ),
          roundCoordinate(
            longitude,
          ),
        );
      },
      [
        disabled,
        onCoordinateSelect,
        projection,
      ],
    );

  if (loadError) {
    return (
      <MapMessage error>
        {loadError}
      </MapMessage>
    );
  }

  if (!geography) {
    return (
      <MapMessage>
        Chargement de la carte…
      </MapMessage>
    );
  }

  return (
    <Geographies
      geography={geography}
    >
      {({ geographies }) =>
        geographies.map(
          (
            region,
            index,
          ) => {
            const name =
              getRegionName(
                region.properties,
              );

            const id =
              region.properties
                ?.shapeID;

            const style =
              variant === 'admin'
                ? ADMIN_REGION_STYLES[
                    index %
                      ADMIN_REGION_STYLES.length
                  ]
                : PUBLIC_REGION_STYLE;

            return (
              <Geography
                key={
                  typeof id ===
                  'string'
                    ? id
                    : `${name}-${index}`
                }
                geography={region}
                aria-label={name}
                tabIndex={-1}
                onClick={
                  onCoordinateSelect
                    ? handleRegionClick
                    : undefined
                }
                pointerEvents={
                  disabled
                    ? 'none'
                    : 'visiblePainted'
                }
                stroke={
                  variant === 'admin'
                    ? '#ffffff'
                    : 'rgba(255,255,255,0.68)'
                }
                strokeWidth={
                  variant === 'admin'
                    ? 1.1
                    : 0.85
                }
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={style}
              >
                <title>
                  {name}
                </title>
              </Geography>
            );
          },
        )
      }
    </Geographies>
  );
}

export const MoroccoRegionsLayer =
  memo(
    MoroccoRegionsLayerComponent,
  );