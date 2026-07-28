'use client';

import {
  ComposableMap,
  createCoordinates,
  Marker,
} from '@vnedyalk0v/react19-simple-maps';

import {
  MoroccoRegionsLayer,
} from '@/components/maps/morocco-regions-layer';

import type {
  AssociationSummary,
} from '@/types/associations';

type InteractiveAssociationsMapProps = {
  associations:
    AssociationSummary[];

  selectedAssociationId:
    | string
    | null;

  hoveredAssociationId:
    | string
    | null;

  onSelect: (
    association:
      AssociationSummary,
  ) => void;

  onHover: (
    associationId:
      | string
      | null,
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

function markerLabel(
  association: AssociationSummary,
) {
  const label = association.name.trim();

  return label.length > 45
    ? `${label.slice(0, 44)}…`
    : label;
}

function markerLabelWidth(
  association: AssociationSummary,
) {
  const label =
    markerLabel(association);

  return Math.min(
    290,
    Math.max(
      160,
      label.length * 7.4 + 32,
    ),
  );
}

export function InteractiveAssociationsMap({
  associations,
  selectedAssociationId,
  hoveredAssociationId,
  onSelect,
  onHover,
}: InteractiveAssociationsMapProps) {
  return (
    <div className="relative mx-auto w-full max-w-[46rem] bg-transparent p-3 sm:p-6 lg:p-8">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={
          MOROCCO_PROJECTION
        }
        width={680}
        height={720}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Carte interactive du Maroc présentant les associations régionales de la FLASCAM"
        className="block h-[480px] w-full sm:h-[620px] lg:h-[660px]"
      >
        <MoroccoRegionsLayer
          variant="public"
        />

        {associations.map(
          (association) => {
            const isSelected =
              association.id ===
              selectedAssociationId;

            const isHovered =
              association.id ===
              hoveredAssociationId;

const labelWidth =
  markerLabelWidth(
    association,
  );              

            return (
              <Marker
                key={
                  association.id
                }
                coordinates={createCoordinates(
                  association.longitude!,
                  association.latitude!,
                )}
              >
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`Afficher la fiche de ${association.name}`}
                  aria-pressed={
                    isSelected
                  }
                  onClick={() =>
                    onSelect(
                      association,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        'Enter' ||
                      event.key ===
                        ' '
                    ) {
                      event.preventDefault();

                      onSelect(
                        association,
                      );
                    }
                  }}
                  onMouseEnter={() =>
                    onHover(
                      association.id,
                    )
                  }
                  onMouseLeave={() =>
                    onHover(null)
                  }
                  onFocus={() =>
                    onHover(
                      association.id,
                    )
                  }
                  onBlur={() =>
                    onHover(null)
                  }
                  className="cursor-pointer outline-none"
                >
                  <circle
                    r={20}
                    fill="transparent"
                  />

                  {(isSelected ||
                    isHovered) && (
                    <circle
                      r={13}
                      fill="rgba(201,111,74,0.3)"
                      pointerEvents="none"
                    />
                  )}

                  <circle
                    r={
                      isSelected
                        ? 8
                        : isHovered
                          ? 7
                          : 6
                    }
                    fill="#c96f4a"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    pointerEvents="none"
                  />

                  {(isSelected ||
                    isHovered) && (
                    <g
                      pointerEvents="none"
                      aria-hidden="true"
                    >
<rect
  x={-labelWidth / 2}
  y={-48}
  width={labelWidth}
  height={34}
  rx={10}
  fill="#ffffff"
  stroke="#dbe5ef"
  strokeWidth={1.25}
  filter="drop-shadow(0 5px 11px rgba(7,53,93,0.2))"
/>

<text
  x={0}
  y={-31}
  textAnchor="middle"
  dominantBaseline="middle"
  fill="#07355d"
  fontSize={9}
  fontWeight={800}
  letterSpacing={0.1}
>
  {markerLabel(
    association,
  )}
</text>
                    </g>
                  )}

                  <title>
                    {association.name}
                  </title>
                </g>
              </Marker>
            );
          },
        )}
      </ComposableMap>
    </div>
  );
}