import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import worldAtlasRaw from 'world-atlas/countries-110m.json';
import { CountryPolity, MapLayer, Region } from '../types/polity';
import { resolveCountryFromFeature } from '../data/countries';
import {
  LEANING_META,
  LEANING_ORDER,
  REGION_CAMERAS,
  SYSTEM_META,
  SYSTEM_ORDER,
} from '../data/taxonomy';

interface WorldMapProps {
  activeLayer: MapLayer;
  activeRegion: Region | 'All';
  selectedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  selectedCountryId: string | null;
  onSelectCountry: (country: CountryPolity | null) => void;
  scopedCountries: CountryPolity[];
  focusCounter: number;
}

interface CountryFeatureProperties {
  name?: string;
}

const MAP_WIDTH = 960;
const MAP_HEIGHT = 490;
const EXCLUDED_IDS = new Set(['010', '260']); // Antarctica & Fr. S. Antarctic Lands

interface TransformState {
  x: number;
  y: number;
  k: number;
}

export function WorldMap({
  activeLayer,
  activeRegion,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedCountryId,
  onSelectCountry,
  scopedCountries,
  focusCounter,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<TransformState>({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<CountryPolity | null>(null);
  const [hoveredNameFallback, setHoveredNameFallback] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(
    null
  );

  // Build Natural Earth projection & path generator
  const { projection, pathGenerator, graticulePath, spherePath, mapFeatures } = useMemo(() => {
    const topo = worldAtlasRaw as unknown as Topology<{
      countries: GeometryCollection<CountryFeatureProperties>;
    }>;
    const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection<
      Geometry,
      CountryFeatureProperties
    >;

    const filteredFeatures = fc.features.filter((f) => {
      const idStr = f.id !== undefined ? String(f.id).padStart(3, '0') : '';
      return !EXCLUDED_IDS.has(idStr);
    });

    const proj = geoNaturalEarth1()
      .scale(178)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2 + 24]);

    const generator = geoPath(proj);
    const grat = generator(geoGraticule10()) || '';
    const sphere = generator({ type: 'Sphere' }) || '';

    const prepared = filteredFeatures.map((feat, idx) => {
      const polity = resolveCountryFromFeature(feat.id, feat.properties?.name);
      const d = generator(feat) || '';
      const centroid = generator.centroid(feat);
      return {
        key: polity ? polity.id : `${feat.id ?? 'feat'}-${idx}`,
        feature: feat as Feature<Geometry, CountryFeatureProperties>,
        d,
        centroid: Array.isArray(centroid) && Number.isFinite(centroid[0]) ? centroid : null,
        polity,
        rawName: feat.properties?.name || 'Territory',
      };
    });

    return {
      projection: proj,
      pathGenerator: generator,
      graticulePath: grat,
      spherePath: sphere,
      mapFeatures: prepared,
    };
  }, []);

  // Compute transform that centers a projected point [px, py] at zoom k
  const computeCenteredTransform = useCallback((px: number, py: number, k: number): TransformState => {
    const clampedK = Math.max(1, Math.min(6, k));
    const x = MAP_WIDTH / 2 - px * clampedK;
    const y = MAP_HEIGHT / 2 - py * clampedK;
    return { x, y, k: clampedK };
  }, []);

  // Respond to region focus changes
  useEffect(() => {
    const cam = REGION_CAMERAS.find((r) => r.region === activeRegion);
    if (!cam || cam.region === 'All') {
      setTransform({ x: 0, y: 0, k: 1 });
      return;
    }
    const projected = projection(cam.center);
    if (projected) {
      setTransform(computeCenteredTransform(projected[0], projected[1], cam.scale));
    }
  }, [activeRegion, projection, computeCenteredTransform]);

  // Smoothly focus on a country when explicitly requested from search/directory
  useEffect(() => {
    if (!selectedCountryId || focusCounter === 0) return;
    const target = mapFeatures.find((f) => f.polity?.id === selectedCountryId);
    if (!target || !target.centroid) return;
    const bounds = pathGenerator.bounds(target.feature);
    const dx = Math.max(1, bounds[1][0] - bounds[0][0]);
    const dy = Math.max(1, bounds[1][1] - bounds[0][1]);
    const autoScale = Math.max(1.8, Math.min(4.2, 0.45 / Math.max(dx / MAP_WIDTH, dy / MAP_HEIGHT)));
    setTransform(computeCenteredTransform(target.centroid[0], target.centroid[1], autoScale));
  }, [selectedCountryId, focusCounter, mapFeatures, pathGenerator, computeCenteredTransform]);

  // Legend category metadata + counts for current regional scope
  const legendItems = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of scopedCountries) {
      const key = activeLayer === 'leaning' ? c.politicalLeaning : c.politicalSystem;
      counts[key] = (counts[key] || 0) + 1;
    }
    const order = activeLayer === 'leaning' ? LEANING_ORDER : SYSTEM_ORDER;
    return order.map((catId) => {
      const meta =
        activeLayer === 'leaning'
          ? LEANING_META[catId as keyof typeof LEANING_META]
          : SYSTEM_META[catId as keyof typeof SYSTEM_META];
      return {
        ...meta,
        count: counts[catId] || 0,
      };
    });
  }, [activeLayer, scopedCountries]);

  // Zoom button helpers
  const zoomBy = useCallback((factor: number) => {
    setTransform((prev) => {
      const nextK = Math.max(1, Math.min(6, prev.k * factor));
      if (nextK === 1) return { x: 0, y: 0, k: 1 };
      const ratio = nextK / prev.k;
      const cx = MAP_WIDTH / 2;
      const cy = MAP_HEIGHT / 2;
      const nextX = cx - (cx - prev.x) * ratio;
      const nextY = cy - (cy - prev.y) * ratio;
      return { x: nextX, y: nextY, k: nextK };
    });
  }, []);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, k: 1 });
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 4) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 0.84;
    zoomBy(factor);
  };

  // Drag-to-pan handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: transform.x,
      ty: transform.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPointerPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = MAP_WIDTH / rect.width;
    const scaleY = MAP_HEIGHT / rect.height;
    const dx = (e.clientX - dragStartRef.current.x) * scaleX;
    const dy = (e.clientY - dragStartRef.current.y) * scaleY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStartRef.current.moved = true;
    }

    setTransform((prev) => ({
      ...prev,
      x: dragStartRef.current!.tx + dx,
      y: dragStartRef.current!.ty + dy,
    }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Determine fill and visual emphasis for each country
  const hasCategoryFilter = selectedCategories.size > 0;
  const matchedVisibleCount = useMemo(() => {
    return scopedCountries.filter((c) => {
      if (!hasCategoryFilter) return true;
      const cat = activeLayer === 'leaning' ? c.politicalLeaning : c.politicalSystem;
      return selectedCategories.has(cat);
    }).length;
  }, [scopedCountries, hasCategoryFilter, activeLayer, selectedCategories]);

  // Tooltip horizontal flip so it stays within map container
  const containerWidth = containerRef.current?.clientWidth ?? 900;
  const containerHeight = containerRef.current?.clientHeight ?? 480;
  const tooltipLeft =
    pointerPos.x > containerWidth - 265 ? Math.max(12, pointerPos.x - 255) : pointerPos.x + 14;
  const tooltipTop =
    pointerPos.y > containerHeight - 135 ? Math.max(12, pointerPos.y - 125) : pointerPos.y + 14;

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col">
      {/* Subtle Top Map Strip */}
      <div className="px-4 sm:px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span className="font-semibold text-stone-900">
            {activeLayer === 'leaning' ? 'Ideological Leaning Layer' : 'Political System Layer'}
          </span>
          <span aria-hidden="true" className="text-stone-300">
            ·
          </span>
          <span>
            {activeRegion === 'All' ? 'Global' : activeRegion}
          </span>
          <span aria-hidden="true" className="text-stone-300">
            ·
          </span>
          <span className="font-mono tabular-nums text-stone-700">
            {matchedVisibleCount} {matchedVisibleCount === 1 ? 'state' : 'states'} highlighted
          </span>
        </div>

        <div className="text-xs text-stone-500">
          Click any country for its dossier · Click legend items below to filter
        </div>
      </div>

      {/* Interactive Cartographic Canvas */}
      <div
        ref={containerRef}
        className="relative w-full bg-[#EEF3F6] select-none overflow-hidden"
        style={{ aspectRatio: '960 / 490' }}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className={`w-full h-full block ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          role="img"
          aria-label={`Global choropleth map showing countries by ${
            activeLayer === 'leaning' ? 'political leaning' : 'political system'
          }`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            setIsDragging(false);
            setHoveredCountry(null);
            setHoveredNameFallback(null);
          }}
        >
          <g
            style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Ocean Sphere */}
            <path d={spherePath} fill="#F3F6F9" stroke="#CBD5E1" strokeWidth={0.75 / transform.k} />

            {/* Cartographic Graticule */}
            <path
              d={graticulePath}
              fill="none"
              stroke="#DCE3EA"
              strokeWidth={0.45 / transform.k}
            />

            {/* Country Polygons */}
            {mapFeatures.map((item) => {
              const polity = item.polity;
              const isSelected = polity ? polity.id === selectedCountryId : false;
              const isHovered = polity
                ? hoveredCountry?.id === polity.id
                : hoveredNameFallback === item.rawName;

              let fill = '#E5E7EB';
              let fillOpacity = 0.85;

              if (polity) {
                const catKey =
                  activeLayer === 'leaning' ? polity.politicalLeaning : polity.politicalSystem;
                const meta =
                  activeLayer === 'leaning'
                    ? LEANING_META[polity.politicalLeaning]
                    : SYSTEM_META[polity.politicalSystem];
                fill = meta.color;

                const matchesRegion =
                  activeRegion === 'All' || polity.region === activeRegion;
                const matchesCategory =
                  !hasCategoryFilter || selectedCategories.has(catKey);

                if (matchesRegion && matchesCategory) {
                  fillOpacity = isHovered || isSelected ? 1 : 0.9;
                } else {
                  fill = '#D6D3D1';
                  fillOpacity = isHovered ? 0.55 : 0.32;
                }
              }

              return (
                <path
                  key={item.key}
                  d={item.d}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={isSelected ? '#0F172A' : isHovered ? '#1E293B' : '#FFFFFF'}
                  strokeWidth={
                    isSelected
                      ? 1.7 / transform.k
                      : isHovered
                        ? 1.15 / transform.k
                        : 0.55 / transform.k
                  }
                  className="transition-opacity duration-150 cursor-pointer outline-none"
                  onMouseEnter={() => {
                    if (polity) {
                      setHoveredCountry(polity);
                      setHoveredNameFallback(null);
                    } else {
                      setHoveredCountry(null);
                      setHoveredNameFallback(item.rawName);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredCountry(null);
                    setHoveredNameFallback(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragStartRef.current?.moved) return;
                    if (polity) {
                      onSelectCountry(polity);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Zoom & Reset Controls */}
        <div className="absolute bottom-3.5 right-3.5 flex items-center bg-white/95 backdrop-blur-xs border border-stone-200 rounded-md shadow-xs overflow-hidden divide-x divide-stone-200">
          <button
            type="button"
            onClick={() => zoomBy(1.35)}
            aria-label="Zoom in"
            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(0.74)}
            aria-label="Zoom out"
            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset map zoom and position"
            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-100 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Readout (subtle cartographic scale indicator) */}
        {transform.k > 1.05 && (
          <div className="absolute bottom-3.5 left-3.5 px-2.5 py-1 bg-white/90 border border-stone-200 rounded text-[11px] font-mono tabular-nums text-stone-600">
            {transform.k.toFixed(1)}× · Drag to pan
          </div>
        )}

        {/* Cursor-Tracked Hover Tooltip */}
        {(hoveredCountry || hoveredNameFallback) && !isDragging && (
          <div
            className="pointer-events-none absolute z-20 w-60 bg-white/98 border border-stone-200 rounded-md shadow-md px-3.5 py-2.5 text-left"
            style={{
              left: `${tooltipLeft}px`,
              top: `${tooltipTop}px`,
            }}
          >
            {hoveredCountry ? (
              <>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-serif font-semibold text-sm text-stone-900 leading-snug">
                    {hoveredCountry.name}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">
                    {hoveredCountry.iso3}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {hoveredCountry.region}
                </div>
                <div className="mt-2 pt-2 border-t border-stone-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                      style={{
                        backgroundColor:
                          LEANING_META[hoveredCountry.politicalLeaning].color,
                      }}
                    />
                    <span className="font-medium text-stone-900">
                      {LEANING_META[hoveredCountry.politicalLeaning].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                      style={{
                        backgroundColor:
                          SYSTEM_META[hoveredCountry.politicalSystem].color,
                      }}
                    />
                    <span className="text-stone-700">
                      {SYSTEM_META[hoveredCountry.politicalSystem].label}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-600 pt-0.5 truncate">
                    Party: <span className="font-medium text-stone-800">{hoveredCountry.rulingParty}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs font-medium text-stone-700">
                {hoveredNameFallback} · No sovereign classification
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Category Legend Filter Bar */}
      <div className="px-4 sm:px-5 py-3.5 border-t border-stone-200 bg-[#FAFAF9]">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="text-xs font-medium text-stone-600">
            {activeLayer === 'leaning'
              ? 'Filter by Political Leaning'
              : 'Filter by Political System'}
            {hasCategoryFilter && (
              <span className="ml-2 font-mono tabular-nums text-stone-500">
                ({selectedCategories.size} selected)
              </span>
            )}
          </div>
          {hasCategoryFilter && (
            <button
              type="button"
              onClick={onClearCategories}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-stone-950 underline underline-offset-2 cursor-pointer whitespace-nowrap"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>Clear filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {legendItems.map((item) => {
            const isActive = selectedCategories.has(item.id);
            const isDimmed = hasCategoryFilter && !isActive;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleCategory(item.id)}
                aria-pressed={isActive}
                className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-md border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                  isActive
                    ? 'bg-white border-stone-900 shadow-xs'
                    : isDimmed
                      ? 'bg-stone-50 border-stone-200/70 opacity-55 hover:opacity-90'
                      : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-[2px] shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-stone-800 truncate">
                    {item.shortLabel}
                  </span>
                </span>
                <span className="text-[11px] font-mono tabular-nums text-stone-500 shrink-0">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
