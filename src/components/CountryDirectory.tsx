import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, RotateCcw } from 'lucide-react';
import { CountryPolity } from '../types/polity';
import { LEANING_META, SYSTEM_META } from '../data/taxonomy';

type SortKey =
  | 'name'
  | 'region'
  | 'politicalSystem'
  | 'rulingParty'
  | 'politicalLeaning'
  | 'lastElectionYear';

interface CountryDirectoryProps {
  countries: CountryPolity[];
  totalCount: number;
  selectedCountryId: string | null;
  onSelectCountry: (country: CountryPolity) => void;
  onResetFilters: () => void;
}

export function CountryDirectory({
  countries,
  totalCount,
  selectedCountryId,
  onSelectCountry,
  onResetFilters,
}: CountryDirectoryProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAll, setShowAll] = useState(false);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'lastElectionYear' ? 'desc' : 'asc');
    }
  };

  const sortedCountries = useMemo(() => {
    const copy = [...countries];
    copy.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
        case 'politicalSystem':
          comparison = SYSTEM_META[a.politicalSystem].label.localeCompare(
            SYSTEM_META[b.politicalSystem].label
          );
          break;
        case 'rulingParty':
          comparison = a.rulingParty.localeCompare(b.rulingParty);
          break;
        case 'politicalLeaning':
          comparison = LEANING_META[a.politicalLeaning].label.localeCompare(
            LEANING_META[b.politicalLeaning].label
          );
          break;
        case 'lastElectionYear':
          comparison = (a.lastElectionYear ?? 0) - (b.lastElectionYear ?? 0);
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
    return copy;
  }, [countries, sortKey, sortDir]);

  const visibleRows = showAll ? sortedCountries : sortedCountries.slice(0, 24);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-3 h-3 text-stone-400" aria-hidden="true" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-stone-900" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3 h-3 text-stone-900" aria-hidden="true" />
    );
  };

  return (
    <section
      id="country-directory"
      aria-labelledby="country-directory-heading"
      className="scroll-mt-20 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-medium text-stone-500">
            02. Complete Reference Index
          </p>
          <h2
            id="country-directory-heading"
            className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1"
          >
            Country Political Directory
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="font-mono tabular-nums">
            Showing {countries.length} of {totalCount} polities
          </span>
          {countries.length < totalCount && (
            <>
              <span aria-hidden="true" className="text-stone-300">
                ·
              </span>
              <button
                type="button"
                onClick={onResetFilters}
                className="font-medium text-[#1E3A8A] hover:underline underline-offset-2 cursor-pointer"
              >
                Reset filters
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        {sortedCountries.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="font-serif text-lg font-medium text-stone-900">
              No countries match the current filter combination
            </p>
            <p className="text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
              Clear your search query, region scope, or category filter to inspect the full global index.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset all filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-stone-200 bg-[#FAFAF9] text-xs font-semibold text-stone-600">
                    <th className="py-3 px-4 sm:px-5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-1.5 hover:text-stone-950 cursor-pointer"
                      >
                        <span>Country</span>
                        {renderSortIcon('name')}
                      </button>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('region')}
                        className="inline-flex items-center gap-1.5 hover:text-stone-950 cursor-pointer"
                      >
                        <span>Region</span>
                        {renderSortIcon('region')}
                      </button>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('politicalSystem')}
                        className="inline-flex items-center gap-1.5 hover:text-stone-950 cursor-pointer"
                      >
                        <span>Political System</span>
                        {renderSortIcon('politicalSystem')}
                      </button>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('rulingParty')}
                        className="inline-flex items-center gap-1.5 hover:text-stone-950 cursor-pointer"
                      >
                        <span>Elected / Ruling Party</span>
                        {renderSortIcon('rulingParty')}
                      </button>
                    </th>
                    <th className="py-3 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('politicalLeaning')}
                        className="inline-flex items-center gap-1.5 hover:text-stone-950 cursor-pointer"
                      >
                        <span>Political Leaning</span>
                        {renderSortIcon('politicalLeaning')}
                      </button>
                    </th>
                    <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleSort('lastElectionYear')}
                        className="inline-flex items-center justify-end gap-1.5 hover:text-stone-950 cursor-pointer ml-auto"
                      >
                        <span>Last Election</span>
                        {renderSortIcon('lastElectionYear')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {visibleRows.map((country) => {
                    const isSelected = country.id === selectedCountryId;
                    const sysMeta = SYSTEM_META[country.politicalSystem];
                    const leanMeta = LEANING_META[country.politicalLeaning];
                    return (
                      <tr
                        key={country.id}
                        onClick={() => onSelectCountry(country)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#1E3A8A]/6' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="py-2.5 px-4 sm:px-5 font-medium text-stone-900 whitespace-nowrap">
                          <span>{country.name}</span>
                          <span className="ml-2 text-[11px] font-mono text-stone-400">
                            {country.iso3}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-stone-600 whitespace-nowrap">
                          {country.region}
                        </td>
                        <td className="py-2.5 px-4 text-xs text-stone-800 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                              style={{ backgroundColor: sysMeta.color }}
                              aria-hidden="true"
                            />
                            <span>{sysMeta.label}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-stone-800 max-w-[260px]">
                          <div className="font-medium text-stone-900 truncate">
                            {country.rulingParty}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {country.leaderName}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-stone-800 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                              style={{ backgroundColor: leanMeta.color }}
                              aria-hidden="true"
                            />
                            <span className="font-medium text-stone-900">
                              {leanMeta.label}
                            </span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 sm:px-5 text-right font-mono tabular-nums text-xs text-stone-600 whitespace-nowrap">
                          {country.lastElectionYear ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedCountries.length > 24 && (
              <div className="px-5 py-3.5 border-t border-stone-200 bg-[#FAFAF9] flex items-center justify-between gap-4">
                <span className="text-xs text-stone-500 font-mono tabular-nums">
                  Displaying {visibleRows.length} of {sortedCountries.length} rows
                </span>
                <button
                  type="button"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="text-xs font-medium text-stone-900 hover:text-[#1E3A8A] underline underline-offset-2 cursor-pointer"
                >
                  {showAll
                    ? 'Show top 24 rows'
                    : `Expand all ${sortedCountries.length} countries`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
