import {
  LEANING_META,
  LEANING_ORDER,
  SYSTEM_META,
  SYSTEM_ORDER,
} from '../data/taxonomy';

export function MethodologySection() {
  return (
    <section
      id="methodology"
      aria-labelledby="methodology-heading"
      className="scroll-mt-20 space-y-6"
    >
      <div className="border-b border-stone-200 pb-4">
        <p className="text-xs font-medium text-stone-500">
          03. Classification Framework
        </p>
        <h2
          id="methodology-heading"
          className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-1"
        >
          Methodology &amp; Taxonomy
        </h2>
        <p className="text-sm text-stone-600 max-w-3xl leading-relaxed mt-2">
          Polity Atlas classifies each sovereign nation and major self-governing territory along two independent axes: the constitutional architecture of its executive and legislative branches (Political System) and the primary programmatic orientation of the sitting governing party or coalition (Political Leaning).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Political Leaning Definitions */}
        <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6">
          <h3 className="font-serif text-lg font-semibold text-stone-900 pb-3 border-b border-stone-200">
            Political Leaning Spectrum
          </h3>
          <dl className="divide-y divide-stone-100 mt-1">
            {LEANING_ORDER.map((id) => {
              const item = LEANING_META[id];
              return (
                <div key={id} className="py-3.5">
                  <dt className="flex items-center gap-2.5 text-sm font-semibold text-stone-900">
                    <span
                      className="w-3 h-3 rounded-[2px] shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </dt>
                  <dd className="text-xs text-stone-600 leading-relaxed mt-1.5 pl-5.5">
                    {item.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        {/* Political System Definitions */}
        <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6">
          <h3 className="font-serif text-lg font-semibold text-stone-900 pb-3 border-b border-stone-200">
            Political System Categories
          </h3>
          <dl className="divide-y divide-stone-100 mt-1">
            {SYSTEM_ORDER.map((id) => {
              const item = SYSTEM_META[id];
              return (
                <div key={id} className="py-3.5">
                  <dt className="flex items-center gap-2.5 text-sm font-semibold text-stone-900">
                    <span
                      className="w-3 h-3 rounded-[2px] shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </dt>
                  <dd className="text-xs text-stone-600 leading-relaxed mt-1.5 pl-5.5">
                    {item.description}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
