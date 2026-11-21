import { useCallback, useMemo, useState } from 'react';
import { COUNTRIES, COUNTRY_BY_ID } from './data/countries';
import { LEANING_META, SYSTEM_META } from './data/taxonomy';
import { CountryPolity, MapLayer, Region } from './types/polity';
import { Header } from './components/Header';
import { AtlasToolbar } from './components/AtlasToolbar';
import { WorldMap } from './components/WorldMap';
import { CountryDossier } from './components/CountryDossier';
import { RegionalTrends } from './components/RegionalTrends';
import { CountryDirectory } from './components/CountryDirectory';
import { MethodologySection } from './components/MethodologySection';

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('leaning');
  const [activeRegion, setActiveRegion] = useState<Region | 'All'>('All');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set()
  );
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusCounter, setFocusCounter] = useState(0);

  const selectedCountry = useMemo(
    () => (selectedCountryId ? COUNTRY_BY_ID[selectedCountryId] ?? null : null),
    [selectedCountryId]
  );

  // Countries scoped to active region (used for legend counts & snapshot)
  const regionScopedCountries = useMemo(() => {
    if (activeRegion === 'All') return COUNTRIES;
    return COUNTRIES.filter((c) => c.region === activeRegion);
  }, [activeRegion]);

  // Countries filtered by region + legend categories + search query (for directory & CSV export)
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return regionScopedCountries.filter((c) => {
      if (selectedCategories.size > 0) {
        const cat =
          activeLayer === 'leaning' ? c.politicalLeaning : c.politicalSystem;
        if (!selectedCategories.has(cat)) return false;
      }
      if (q) {
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.rulingParty.toLowerCase().includes(q) ||
          c.leaderName.toLowerCase().includes(q) ||
          c.iso3.toLowerCase().includes(q) ||
          SYSTEM_META[c.politicalSystem].label.toLowerCase().includes(q) ||
          LEANING_META[c.politicalLeaning].label.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [regionScopedCountries, selectedCategories, activeLayer, searchQuery]);

  const handleLayerChange = useCallback((nextLayer: MapLayer) => {
    setActiveLayer(nextLayer);
    setSelectedCategories(new Set());
  }, []);

  const handleToggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleClearCategories = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  const handleResetAllFilters = useCallback(() => {
    setActiveRegion('All');
    setSelectedCategories(new Set());
    setSearchQuery('');
  }, []);

  const handleSelectCountryFromMap = useCallback(
    (country: CountryPolity | null) => {
      setSelectedCountryId(country ? country.id : null);
    },
    []
  );

  const handleSelectCountryWithFocus = useCallback((country: CountryPolity) => {
    setSelectedCountryId(country.id);
    setFocusCounter((c) => c + 1);
    const mapSection = document.getElementById('world-map');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleExportCsv = useCallback(() => {
    const headers = [
      'Country',
      'ISO3',
      'Region',
      'Political System',
      'Political Leaning',
      'Elected / Ruling Party',
      'Coalition',
      'Leader',
      'Leader Title',
      'Last Election Year',
      'Legislature',
    ];

    const rows = filteredCountries.map((c) => [
      c.name,
      c.iso3,
      c.region,
      SYSTEM_META[c.politicalSystem].label,
      LEANING_META[c.politicalLeaning].label,
      c.rulingParty,
      c.coalition ?? '',
      c.leaderName,
      c.leaderTitle,
      c.lastElectionYear ?? '',
      c.legislature,
    ]);

    const csvString = [headers, ...rows]
      .map((row) => row.map(escapeCsvCell).join(','))
      .join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const regionSlug =
      activeRegion === 'All'
        ? 'global'
        : activeRegion.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `polity-atlas-${regionSlug}-${activeLayer}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredCountries, activeRegion, activeLayer]);

  return (
    <div id="atlas-top" className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#111827]">
      {/* 3-Zone Editorial Top Bar */}
      <Header
        onExportCsv={handleExportCsv}
        filteredCount={filteredCountries.length}
      />

      {/* Interactive Workspace Toolbar */}
      <AtlasToolbar
        activeLayer={activeLayer}
        onLayerChange={handleLayerChange}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        countries={COUNTRIES}
        onSelectCountry={handleSelectCountryWithFocus}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-14">
        {/* Editorial Masthead Intro + Primary Atlas Stage */}
        <section id="world-map" className="scroll-mt-24 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="text-xs text-stone-500 flex items-center gap-2">
                <span>Comparative Geopolitical Reference</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {COUNTRIES.length} Sovereign States &amp; Territories
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 mt-1.5 leading-tight">
                Global Political Systems, Ruling Parties &amp; Ideological Trends
              </h1>
            </div>

            <div className="flex items-center gap-6 text-xs text-stone-600 shrink-0 pb-1">
              <div>
                <div className="text-stone-400">Active View</div>
                <div className="font-medium text-stone-900 mt-0.5">
                  {activeLayer === 'leaning'
                    ? 'Political Leaning'
                    : 'Political System'}
                </div>
              </div>
              <div className="h-7 w-px bg-stone-200" aria-hidden="true" />
              <div>
                <div className="text-stone-400">Projection</div>
                <div className="font-medium text-stone-900 mt-0.5">
                  Natural Earth I
                </div>
              </div>
            </div>
          </div>

          {/* 70/30 Asymmetric Atlas Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 xl:col-span-9 min-w-0">
              <WorldMap
                activeLayer={activeLayer}
                activeRegion={activeRegion}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                onClearCategories={handleClearCategories}
                selectedCountryId={selectedCountryId}
                onSelectCountry={handleSelectCountryFromMap}
                scopedCountries={regionScopedCountries}
                focusCounter={focusCounter}
              />
            </div>

            <div className="lg:col-span-4 xl:col-span-3 min-w-0">
              <CountryDossier
                selectedCountry={selectedCountry}
                onClearSelection={() => setSelectedCountryId(null)}
                onFocusRegion={(region) => setActiveRegion(region)}
                onSelectCountry={handleSelectCountryWithFocus}
                activeRegion={activeRegion}
                activeLayer={activeLayer}
                scopedCountries={regionScopedCountries}
                allCountries={COUNTRIES}
              />
            </div>
          </div>
        </section>

        {/* Global & Regional Trends */}
        <RegionalTrends
          countries={COUNTRIES}
          activeLayer={activeLayer}
          activeRegion={activeRegion}
          selectedCategories={selectedCategories}
          onSelectRegion={setActiveRegion}
          onToggleCategory={handleToggleCategory}
        />

        {/* Sortable Country Directory */}
        <CountryDirectory
          countries={filteredCountries}
          totalCount={COUNTRIES.length}
          selectedCountryId={selectedCountryId}
          onSelectCountry={handleSelectCountryWithFocus}
          onResetFilters={handleResetAllFilters}
        />

        {/* Methodology & Taxonomy Reference */}
        <MethodologySection />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white mt-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-stone-900">Polity Atlas</span>
            <span aria-hidden="true">·</span>
            <span>Global Political Systems &amp; Leanings</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#world-map" className="hover:text-stone-900 transition-colors">
              World Map
            </a>
            <a href="#regional-trends" className="hover:text-stone-900 transition-colors">
              Trends
            </a>
            <a href="#country-directory" className="hover:text-stone-900 transition-colors">
              Directory
            </a>
            <a href="#methodology" className="hover:text-stone-900 transition-colors">
              Methodology
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
