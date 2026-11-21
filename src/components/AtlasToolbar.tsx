import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { CountryPolity, MapLayer, Region } from '../types/polity';
import { LEANING_META, REGION_CAMERAS, SYSTEM_META } from '../data/taxonomy';

interface AtlasToolbarProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
  activeRegion: Region | 'All';
  onRegionChange: (region: Region | 'All') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  countries: CountryPolity[];
  onSelectCountry: (country: CountryPolity) => void;
}

export function AtlasToolbar({
  activeLayer,
  onLayerChange,
  activeRegion,
  onRegionChange,
  searchQuery,
  onSearchChange,
  countries,
  onSelectCountry,
}: AtlasToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return countries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.rulingParty.toLowerCase().includes(q) ||
          c.leaderName.toLowerCase().includes(q) ||
          c.iso3.toLowerCase().includes(q) ||
          SYSTEM_META[c.politicalSystem].label.toLowerCase().includes(q) ||
          LEANING_META[c.politicalLeaning].label.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [countries, searchQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + searchResults.length) % searchResults.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = searchResults[highlightedIndex];
      if (target) {
        onSelectCountry(target);
        setDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3.5">
        {/* Layer Toggle + Region Focus */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 flex-wrap">
          {/* Switchable Color Layer Segmented Control */}
          <div
            role="group"
            aria-label="Map color layer"
            className="inline-flex items-center p-1 bg-stone-100 rounded-md border border-stone-200/80 self-start"
          >
            <button
              type="button"
              onClick={() => onLayerChange('leaning')}
              aria-pressed={activeLayer === 'leaning'}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                activeLayer === 'leaning'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Political Leaning
            </button>
            <button
              type="button"
              onClick={() => onLayerChange('system')}
              aria-pressed={activeLayer === 'system'}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                activeLayer === 'system'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Political System
            </button>
          </div>

          <div className="hidden sm:block h-5 w-px bg-stone-200" aria-hidden="true" />

          {/* Region Quick-Focus Bar */}
          <div
            role="group"
            aria-label="Region focus"
            className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0"
          >
            {REGION_CAMERAS.map((cam) => {
              const active = activeRegion === cam.region;
              return (
                <button
                  key={cam.region}
                  type="button"
                  onClick={() => onRegionChange(cam.region)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {cam.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Search Box with Instant Autocomplete */}
        <div ref={containerRef} className="relative w-full xl:w-80 shrink-0">
          <label htmlFor="atlas-country-search" className="sr-only">
            Search countries, ruling parties, or leaders
          </label>
          <Search
            className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="atlas-country-search"
            type="text"
            value={searchQuery}
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search country, party, or leader..."
            autoComplete="off"
            className="w-full h-9 pl-9 pr-8 text-sm bg-stone-50 border border-stone-200 rounded-md text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-[#1E3A8A]/15 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setDropdownOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {dropdownOpen && searchQuery.trim().length > 0 && (
            <div
              role="listbox"
              className="absolute left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-md shadow-lg z-40 overflow-hidden"
            >
              {searchResults.length === 0 ? (
                <div className="px-3.5 py-4 text-xs text-stone-500 text-center">
                  No countries or parties match &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                <ul className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                  {searchResults.map((country, idx) => {
                    const meta =
                      activeLayer === 'leaning'
                        ? LEANING_META[country.politicalLeaning]
                        : SYSTEM_META[country.politicalSystem];
                    return (
                      <li key={country.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCountry(country);
                            setDropdownOpen(false);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                            idx === highlightedIndex
                              ? 'bg-stone-100'
                              : 'hover:bg-stone-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-stone-900 truncate">
                              {country.name}
                            </div>
                            <div className="text-xs text-stone-500 truncate mt-0.5">
                              {country.rulingParty} · {country.leaderName}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                              style={{ backgroundColor: meta.color }}
                              aria-hidden="true"
                            />
                            <span className="text-[11px] font-medium text-stone-600 whitespace-nowrap">
                              {meta.shortLabel}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
