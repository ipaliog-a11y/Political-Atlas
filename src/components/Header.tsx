import { Download } from 'lucide-react';

interface HeaderProps {
  onExportCsv: () => void;
  filteredCount: number;
}

export function Header({ onExportCsv, filteredCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#atlas-top"
          className="font-serif text-xl font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-sm"
        >
          Polity Atlas
        </a>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          <a
            href="#world-map"
            className="hover:text-stone-900 hover:underline underline-offset-4 decoration-stone-400 transition-colors whitespace-nowrap shrink-0"
          >
            World Map
          </a>
          <a
            href="#regional-trends"
            className="hover:text-stone-900 hover:underline underline-offset-4 decoration-stone-400 transition-colors whitespace-nowrap shrink-0"
          >
            Regional Trends
          </a>
          <a
            href="#country-directory"
            className="hover:text-stone-900 hover:underline underline-offset-4 decoration-stone-400 transition-colors whitespace-nowrap shrink-0"
          >
            Directory
          </a>
          <a
            href="#methodology"
            className="hover:text-stone-900 hover:underline underline-offset-4 decoration-stone-400 transition-colors whitespace-nowrap shrink-0"
          >
            Methodology
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            title={`Export ${filteredCount} currently visible countries as CSV`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-950 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E3A8A]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
