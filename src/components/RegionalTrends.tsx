import { useMemo } from 'react';
import { CountryPolity, MapLayer, Region } from '../types/polity';
import {
  LEANING_META,
  LEANING_ORDER,
  REGIONS,
  SYSTEM_META,
  SYSTEM_ORDER,
} from '../data/taxonomy';

interface RegionalTrendsProps {
  countries: CountryPolity[];
  activeLayer: MapLayer;
  activeRegion: Region | 'All';
  selectedCategories: Set<string>;
  onSelectRegion: (region: Region | 'All') => void;
  onToggleCategory: (categoryId: string) => void;
}

export function RegionalTrends({
  countries,
  activeLayer,
  activeRegion,
  selectedCategories,
  onSelectRegion,
  onToggleCategory,
}: RegionalTrendsProps) {
  const categoryOrder = activeLayer === 'leaning' ? LEANING_ORDER : SYSTEM_ORDER;

  const getMeta = (id: string) =>
    activeLayer === 'leaning'
      ? LEANING_META[id as keyof typeof LEANING_META]
      : SYSTEM_META[id as keyof typeof SYSTEM_META];

  const getValue = (c: CountryPolity) =>
    activeLayer === 'leaning' ? c.politicalLeaning : c.politicalSystem;

  // Global distribution for the active layer
  const globalBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of countries) {
      const k = getValue(c);
      counts[k] = (counts[k] || 0) + 1;
    }
    const total = Math.max(1, countries.length);
    return categoryOrder.map((id) => {
      const count = counts[id] || 0;
      return {
        id,
        meta: getMeta(id),
        count,
        pct: (count / total) * 100,
      };
    });
  }, [countries, activeLayer]);

  // Regional breakdown rows
  const regionalRows = useMemo(() => {
    return REGIONS.map((region) => {
      const regionalCountries = countries.filter((c) => c.region === region);
      const total = regionalCountries.length;
      const counts: Record<string, number> = {};
      for (const c of regionalCountries) {
        const k = getValue(c);
        counts[k] = (counts[k] || 0) + 1;
      }

      const segments = categoryOrder
        .map((id) => ({
          id,
          meta: getMeta(id),
          count: counts[id] || 0,
          pct: total > 0 ? ((counts[id] || 0) / total) * 100 : 0,
        }))
        .filter((s) => s.count > 0);

      const dominant = [...segments].sort((a, b) => b.count - a.count)[0];

      return {
        region,
        total,
        segments,
        dominant,
      };
    });
  }, [countries, activeLayer]);

  // System x Leaning Cross-Tabulation Matrix
  const crossTab = useMemo(() => {
    const scoped =
      activeRegion === 'All'
        ? countries
        : countries.filter((c) => c.region === activeRegion);

    let maxCell = 1;
    const rows = SYSTEM_ORDER.map((sysId) => {
      const sysCountries = scoped.filter((c) => c.politicalSystem === sysId);
      const cells = LEANING_ORDER.map((leanId) => {
        const count = sysCountries.filter((c) => c.politicalLeaning === leanId).length;
        if (count > maxCell) maxCell = count;
        return { leanId, count };
      });
      return {
        sysId,
        meta: SYSTEM_META[sysId],
        total: sysCountries.length,
        cells,
      };
    });

    return { rows, maxCell, totalScoped: scoped.length };
  }, [countries, activeRegion]);

  return (
    <section
      id="regional-trends"
      aria-labelledby="regional-trends-heading"
      className="scroll-mt-20 space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium text-stone-500">
            01. Comparative Distribution
          </p>
          <h2
            id="regional-trends-heading"
            className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1"
          >
            Global &amp; Regional Trends
          </h2>
        </div>
        <p className="text-sm text-stone-600 max-w-md">
          Showing proportional breakdown by{' '}
          <span className="font-medium text-stone-900">
            {activeLayer === 'leaning' ? 'political leaning' : 'political system'}
          </span>
          . Click any region row or bar segment to filter the map above.
        </p>
      </div>

      {/* Global Composition Stacked Bar + Regional Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Global Composition */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-lg p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2 mb-4">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Global Share
            </h3>
            <span className="text-xs font-mono tabular-nums text-stone-500">
              {countries.length} mapped polities
            </span>
          </div>

          {/* Stacked Bar */}
          <div
            className="h-5 w-full rounded-sm overflow-hidden flex bg-stone-100"
            role="img"
            aria-label="Global proportional distribution bar"
          >
            {globalBreakdown.map((item) => {
              if (item.count === 0) return null;
              const isSelected = selectedCategories.has(item.id);
              const isDimmed = selectedCategories.size > 0 && !isSelected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleCategory(item.id)}
                  title={`${item.meta.label}: ${item.count} (${item.pct.toFixed(1)}%)`}
                  style={{
                    width: `${item.pct}%`,
                    backgroundColor: item.meta.color,
                    opacity: isDimmed ? 0.28 : 1,
                  }}
                  className="h-full transition-opacity duration-150 hover:opacity-85 cursor-pointer border-r border-white/60 last:border-r-0"
                />
              );
            })}
          </div>

          {/* Structured Category Table */}
          <div className="mt-5 divide-y divide-stone-100">
            {globalBreakdown.map((item) => {
              const isSelected = selectedCategories.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleCategory(item.id)}
                  className={`w-full py-2.5 px-2 -mx-2 rounded flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-stone-100' : 'hover:bg-stone-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-[2px] shrink-0"
                      style={{ backgroundColor: item.meta.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-stone-800 truncate">
                      {item.meta.label}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 font-mono tabular-nums text-xs shrink-0">
                    <span className="text-stone-900 font-medium w-7 text-right">
                      {item.count}
                    </span>
                    <span className="text-stone-500 w-12 text-right">
                      {item.pct.toFixed(1)}%
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Regional Breakdown Matrix */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-lg p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2 mb-5">
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Regional Composition
            </h3>
            {activeRegion !== 'All' ? (
              <button
                type="button"
                onClick={() => onSelectRegion('All')}
                className="text-xs font-medium text-[#1E3A8A] hover:underline underline-offset-2 cursor-pointer"
              >
                Show all regions
              </button>
            ) : (
              <span className="text-xs text-stone-500">
                Click a region to focus map
              </span>
            )}
          </div>

          <div className="space-y-5">
            {regionalRows.map((row) => {
              const isRegionSelected = activeRegion === row.region;
              return (
                <div
                  key={row.region}
                  className={`p-3 -mx-3 rounded-md transition-colors ${
                    isRegionSelected ? 'bg-stone-100/90' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectRegion(isRegionSelected ? 'All' : row.region)
                      }
                      className="text-sm font-semibold text-stone-900 hover:text-[#1E3A8A] transition-colors text-left cursor-pointer"
                    >
                      {row.region}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      {row.dominant && (
                        <>
                          <span>Lead:</span>
                          <span className="font-medium text-stone-800">
                            {row.dominant.meta.shortLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span className="font-mono tabular-nums text-stone-600">
                        {row.total} states
                      </span>
                    </div>
                  </div>

                  {/* Proportional Regional Bar */}
                  <div className="h-4 w-full rounded-xs overflow-hidden flex bg-stone-100">
                    {row.segments.map((seg) => {
                      const isDimmed =
                        selectedCategories.size > 0 &&
                        !selectedCategories.has(seg.id);
                      return (
                        <button
                          key={seg.id}
                          type="button"
                          onClick={() => onToggleCategory(seg.id)}
                          title={`${row.region} — ${seg.meta.label}: ${seg.count} (${seg.pct.toFixed(0)}%)`}
                          style={{
                            width: `${seg.pct}%`,
                            backgroundColor: seg.meta.color,
                            opacity: isDimmed ? 0.25 : 1,
                          }}
                          className="h-full transition-opacity duration-150 hover:opacity-85 cursor-pointer border-r border-white/60 last:border-r-0"
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cross-Tabulation: Political System x Political Leaning */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              System &times; Ideological Leaning Matrix
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cross-tabulation of governing systems against current ideological alignment
              {activeRegion !== 'All' ? ` in ${activeRegion}` : ' worldwide'}.
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-stone-500 shrink-0">
            n = {crossTab.totalScoped}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAFAF9]">
                <th className="py-3 px-5 text-xs font-semibold text-stone-600 whitespace-nowrap">
                  Political System
                </th>
                {LEANING_ORDER.map((leanId) => {
                  const meta = LEANING_META[leanId];
                  return (
                    <th
                      key={leanId}
                      className="py-3 px-3 text-xs font-medium text-stone-600 text-right whitespace-nowrap"
                    >
                      <span className="inline-flex items-center justify-end gap-1.5">
                        <span
                          className="w-2 h-2 rounded-[2px] shrink-0"
                          style={{ backgroundColor: meta.color }}
                          aria-hidden="true"
                        />
                        <span>{meta.shortLabel}</span>
                      </span>
                    </th>
                  );
                })}
                <th className="py-3 px-5 text-xs font-semibold text-stone-700 text-right whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {crossTab.rows.map((row) => (
                <tr key={row.sysId} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-2.5 px-5 font-medium text-stone-900 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                        style={{ backgroundColor: row.meta.color }}
                        aria-hidden="true"
                      />
                      <span>{row.meta.label}</span>
                    </span>
                  </td>
                  {row.cells.map((cell) => {
                    const intensity =
                      cell.count > 0
                        ? Math.min(0.22, 0.05 + (cell.count / crossTab.maxCell) * 0.17)
                        : 0;
                    return (
                      <td
                        key={cell.leanId}
                        className="py-2.5 px-3 text-right font-mono tabular-nums text-xs"
                        style={{
                          backgroundColor:
                            cell.count > 0
                              ? `rgba(30, 58, 138, ${intensity.toFixed(3)})`
                              : 'transparent',
                        }}
                      >
                        <span
                          className={
                            cell.count > 0
                              ? 'font-medium text-stone-900'
                              : 'text-stone-300'
                          }
                        >
                          {cell.count > 0 ? cell.count : '—'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-5 text-right font-mono tabular-nums text-xs font-semibold text-stone-900">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
