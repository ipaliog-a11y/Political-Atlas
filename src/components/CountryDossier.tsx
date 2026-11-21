import { useMemo } from 'react';
import { ArrowUpRight, Compass, X } from 'lucide-react';
import { CountryPolity, MapLayer, Region } from '../types/polity';
import {
  LEANING_META,
  SPOTLIGHT_COUNTRY_IDS,
  SYSTEM_META,
} from '../data/taxonomy';

interface CountryDossierProps {
  selectedCountry: CountryPolity | null;
  onClearSelection: () => void;
  onFocusRegion: (region: Region) => void;
  onSelectCountry: (country: CountryPolity) => void;
  activeRegion: Region | 'All';
  activeLayer: MapLayer;
  scopedCountries: CountryPolity[];
  allCountries: CountryPolity[];
}

export function CountryDossier({
  selectedCountry,
  onClearSelection,
  onFocusRegion,
  onSelectCountry,
  activeRegion,
  activeLayer,
  scopedCountries,
  allCountries,
}: CountryDossierProps) {
  const snapshotStats = useMemo(() => {
    const leaningCounts: Record<string, number> = {};
    const systemCounts: Record<string, number> = {};

    for (const c of scopedCountries) {
      leaningCounts[c.politicalLeaning] = (leaningCounts[c.politicalLeaning] || 0) + 1;
      systemCounts[c.politicalSystem] = (systemCounts[c.politicalSystem] || 0) + 1;
    }

    const topLeaningEntry = Object.entries(leaningCounts).sort((a, b) => b[1] - a[1])[0];
    const topSystemEntry = Object.entries(systemCounts).sort((a, b) => b[1] - a[1])[0];

    const total = Math.max(1, scopedCountries.length);

    return {
      total: scopedCountries.length,
      topLeaning: topLeaningEntry
        ? {
            meta: LEANING_META[topLeaningEntry[0] as keyof typeof LEANING_META],
            count: topLeaningEntry[1],
            pct: Math.round((topLeaningEntry[1] / total) * 100),
          }
        : null,
      topSystem: topSystemEntry
        ? {
            meta: SYSTEM_META[topSystemEntry[0] as keyof typeof SYSTEM_META],
            count: topSystemEntry[1],
            pct: Math.round((topSystemEntry[1] / total) * 100),
          }
        : null,
    };
  }, [scopedCountries]);

  const quickInspectCountries = useMemo(() => {
    if (activeRegion === 'All') {
      return SPOTLIGHT_COUNTRY_IDS.map((id) =>
        allCountries.find((c) => c.id === id)
      ).filter((c): c is CountryPolity => Boolean(c));
    }
    return scopedCountries.slice(0, 8);
  }, [activeRegion, allCountries, scopedCountries]);

  if (selectedCountry) {
    const leaning = LEANING_META[selectedCountry.politicalLeaning];
    const system = SYSTEM_META[selectedCountry.politicalSystem];

    return (
      <aside
        aria-label="Country Political Dossier"
        className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 flex flex-col justify-between h-full"
      >
        <div>
          {/* Unboxed Editorial Kicker */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-200">
            <div className="text-xs text-stone-500 flex items-center gap-1.5 min-w-0 truncate">
              <span className="truncate">{selectedCountry.region}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-stone-600">{selectedCountry.iso3}</span>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Close country dossier"
              className="p-1 text-stone-400 hover:text-stone-900 rounded transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Country Display Title */}
          <div className="pt-4 pb-4">
            <h2 className="font-serif text-2xl sm:text-[26px] font-semibold text-stone-900 leading-tight">
              {selectedCountry.name}
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mt-2.5">
              {selectedCountry.summary}
            </p>
          </div>

          {/* Accession-Style Structured Definition List */}
          <dl className="divide-y divide-stone-200/80 border-t border-b border-stone-200 text-sm">
            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Political Leaning
              </dt>
              <dd className="col-span-7 flex items-center gap-2 font-medium text-stone-900">
                <span
                  className="w-3 h-3 rounded-[2px] shrink-0"
                  style={{ backgroundColor: leaning.color }}
                  aria-hidden="true"
                />
                <span>{leaning.label}</span>
              </dd>
            </div>

            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Political System
              </dt>
              <dd className="col-span-7 flex items-center gap-2 font-medium text-stone-900">
                <span
                  className="w-3 h-3 rounded-[2px] shrink-0"
                  style={{ backgroundColor: system.color }}
                  aria-hidden="true"
                />
                <span>{system.label}</span>
              </dd>
            </div>

            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Elected / Ruling Party
              </dt>
              <dd className="col-span-7 text-stone-900">
                <div className="font-medium leading-snug">{selectedCountry.rulingParty}</div>
                {selectedCountry.coalition && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    {selectedCountry.coalition}
                  </div>
                )}
              </dd>
            </div>

            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Head of Government
              </dt>
              <dd className="col-span-7 text-stone-900">
                <div className="font-medium leading-snug">{selectedCountry.leaderName}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {selectedCountry.leaderTitle}
                </div>
              </dd>
            </div>

            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Last Election
              </dt>
              <dd className="col-span-7 font-mono tabular-nums text-stone-900">
                {selectedCountry.lastElectionYear ?? 'Non-electoral'}
              </dd>
            </div>

            <div className="py-3 grid grid-cols-12 gap-2 items-start">
              <dt className="col-span-5 text-xs font-medium text-stone-500 pt-0.5">
                Legislature
              </dt>
              <dd className="col-span-7 text-stone-800 text-xs leading-relaxed">
                {selectedCountry.legislature}
              </dd>
            </div>
          </dl>
        </div>

        {/* Bottom Contextual Actions */}
        <div className="pt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onFocusRegion(selectedCountry.region)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Focus {selectedCountry.region}</span>
          </button>

          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer whitespace-nowrap"
          >
            Back to overview
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Global Political Snapshot"
      className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 flex flex-col justify-between h-full"
    >
      <div>
        <div className="pb-3 border-b border-stone-200 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-stone-500">
            {activeRegion === 'All' ? 'Global Snapshot' : `${activeRegion} Snapshot`}
          </span>
          <span className="text-xs font-mono tabular-nums text-stone-500">
            {snapshotStats.total} polities
          </span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 mt-4 leading-snug">
          Select a country to inspect its government
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed mt-1.5">
          Click any state on the map or choose a quick reference below to inspect its political system, ruling party, and ideological orientation.
        </p>

        {/* Dominant Trend Readouts */}
        <div className="mt-5 border-t border-b border-stone-200 divide-y divide-stone-200">
          {snapshotStats.topLeaning && (
            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-stone-500">Most common leaning</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: snapshotStats.topLeaning.meta.color }}
                  />
                  <span className="text-sm font-medium text-stone-900">
                    {snapshotStats.topLeaning.meta.label}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-semibold text-stone-900">
                  {snapshotStats.topLeaning.pct}%
                </div>
                <div className="text-[11px] text-stone-500">
                  {snapshotStats.topLeaning.count} states
                </div>
              </div>
            </div>
          )}

          {snapshotStats.topSystem && (
            <div className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-stone-500">Most common system</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                    style={{ backgroundColor: snapshotStats.topSystem.meta.color }}
                  />
                  <span className="text-sm font-medium text-stone-900">
                    {snapshotStats.topSystem.meta.label}
                  </span>
                </div>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-semibold text-stone-900">
                  {snapshotStats.topSystem.pct}%
                </div>
                <div className="text-[11px] text-stone-500">
                  {snapshotStats.topSystem.count} states
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick-Inspect Spotlight List */}
        <div className="mt-4">
          <div className="text-xs font-medium text-stone-500 mb-2">
            {activeRegion === 'All' ? 'Featured polities' : `States in ${activeRegion}`}
          </div>
          <ul className="divide-y divide-stone-100">
            {quickInspectCountries.map((country) => {
              const meta =
                activeLayer === 'leaning'
                  ? LEANING_META[country.politicalLeaning]
                  : SYSTEM_META[country.politicalSystem];
              return (
                <li key={country.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCountry(country)}
                    className="w-full py-2 px-1.5 -mx-1.5 rounded flex items-center justify-between gap-3 text-left hover:bg-stone-50 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-stone-900 group-hover:text-[#1E3A8A] transition-colors truncate">
                        {country.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {country.rulingParty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-[2px]"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] text-stone-600 whitespace-nowrap">
                        {meta.shortLabel}
                      </span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-700 transition-colors"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
