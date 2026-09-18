import { useState, useEffect, useRef } from 'react';
import { offenceService } from '../services/api';

const OffenceSearch = ({ onSelect, selectedOffence }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (query.trim() === '') {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(() => {
      offenceService.search(query)
        .then(data => {
          setResults(data);
          setIsOpen(true);
        })
        .catch(err => {
          console.error('Failed to search offences:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);


  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSelect = (offence) => {
    onSelect(offence);
    setQuery('');
    setIsOpen(false);
  };


  const formatMaxPunishment = (offence) => {
    if (offence.death_or_life_exclusion === 1) {
      return 'Death / Life imprisonment';
    }

    const years = offence.max_imprisonment_years || 0;
    const days = offence.max_imprisonment_days || 0;

    if (years > 0 && days > 0) {
      return `${years} years, ${days} days`;
    }

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }

    if (days > 0) {
      return `${days} days`;
    }

    return 'N/A';
  };


  /*
   * ============================================================
   * SELECTED OFFENCE
   * ============================================================
   */

  if (selectedOffence) {
    return (
      <div className="rounded-xl border border-[#D8B9A0] bg-white overflow-hidden shadow-sm">

        {/* Selected header */}
        <div className="flex items-center justify-between border-b border-[#E8D5C4] bg-[#FFF9F5] px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF7F0] border border-[#BBD8C3]">

              <svg
                className="h-5 w-5 text-[#4F8A62]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3z"
                  clipRule="evenodd"
                />
              </svg>

            </div>


            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4F8A62]">
                Offence Selected
              </p>

              <p className="mt-1 text-sm text-[#806F64]">
                Database record linked to this screening
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-[#6B574B] transition-colors hover:bg-[#F5E8DE] hover:text-[#2B170D]"
          >
            Change
          </button>

        </div>


        {/* Selected offence details */}
        <div className="p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div>

              {/* Law + section */}
              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-md border border-[#D8B9A0] bg-[#FFF4EC] px-3 py-1.5 text-sm font-bold tracking-wide text-[#7A3A12]">
                  {selectedOffence.law_code}
                </span>

                <span className="text-[#806F64]">
                  §
                </span>

                <span className="text-base font-semibold text-[#4A2A1A]">
                  {selectedOffence.section}
                </span>

              </div>


              {/* Offence name */}
              <h3 className="mt-3 text-xl font-semibold leading-snug text-[#2B170D]">
                {selectedOffence.offence_name}
              </h3>

            </div>


            {/* Maximum punishment */}
            <div className="flex-shrink-0 rounded-lg border border-[#D8B9A0] bg-[#FFF9F5] px-4 py-3 sm:min-w-[210px]">

              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
                Maximum Punishment
              </p>

              <p className="mt-1.5 text-base font-semibold text-[#4A2A1A]">
                {formatMaxPunishment(selectedOffence)}
              </p>

            </div>

          </div>


          {/* Exclusion warning */}
          {selectedOffence.death_or_life_exclusion === 1 && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#E4B7B7] bg-[#FFF4F4] px-4 py-4">

              <span className="mt-0.5 text-lg text-[#B94343]">
                ⚠
              </span>

              <div>

                <p className="text-sm font-semibold text-[#B94343]">
                  Exclusion Flag
                </p>

                <p className="mt-1 text-sm leading-relaxed text-[#704040]">
                  This offence is marked in the configured database as
                  excluded from the statutory screening rule.
                </p>

              </div>

            </div>
          )}


          {/* Source */}
          <div className="mt-5 border-t border-[#E8D5C4] pt-5">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Source Reference
            </p>

            <p className="mt-1.5 text-sm leading-relaxed text-[#75645A]">
              {selectedOffence.source_reference || 'No source reference available'}
            </p>

          </div>

        </div>

      </div>
    );
  }


  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  return (
    <div
      className="relative"
      ref={wrapperRef}
    >

      {/* Search label */}
      <div className="mb-3">

        <label className="block text-sm font-semibold uppercase tracking-[0.12em] text-[#5E4B40]">
          Search Offence Database
        </label>

        <p className="mt-1 text-sm text-[#806F64]">
          Search using the offence name, law code or section number.
        </p>

      </div>


      {/* Search input */}
      <div className="relative">

        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">

          <svg
            className="h-5 w-5 text-[#806F64]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>

        </div>


        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="block w-full rounded-xl border border-[#D8B9A0] bg-white py-4 pl-12 pr-12 text-base text-[#2B170D] placeholder-[#806F64] transition-all duration-200 focus:border-[#C65A16] focus:ring-2 focus:ring-[#C65A16]/20"
          placeholder="Search by offence name, section, or law code..."
        />


        {/* Loading spinner */}
        {loading && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">

            <svg
              className="h-5 w-5 animate-spin text-[#C65A16]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >

              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />

            </svg>

          </div>
        )}

      </div>


      {/* Search hint */}
      {!isOpen && !query && (
        <div className="mt-3 flex items-center gap-2 text-sm text-[#806F64]">

          <span className="h-2 w-2 rounded-full bg-[#C65A16]"></span>

          <span>
            Start typing to search the configured offence database
          </span>

        </div>
      )}


      {/* ========================================================
          SEARCH RESULTS
      ========================================================= */}

      {isOpen && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#D8B9A0] bg-white shadow-xl">

          {/* Result header */}
          <div className="flex items-center justify-between border-b border-[#E8D5C4] bg-[#FFF9F5] px-4 py-3.5">

            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#806F64]">
              Matching Offences
            </span>

            <span className="rounded-full border border-[#D8B9A0] bg-white px-2.5 py-1 text-xs font-semibold text-[#5E4B40]">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>

          </div>


          <div className="max-h-80 overflow-y-auto">

            {results.map((offence) => (
              <div
                key={offence.id}
                className="group cursor-pointer select-none border-b border-[#EFE1D6] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#FFF4EC]"
                onClick={() => handleSelect(offence)}
              >

                <div className="flex items-start justify-between gap-5">

                  <div className="min-w-0">

                    {/* Law + section */}
                    <div className="flex flex-wrap items-center gap-2">

                      <span className="rounded-md bg-[#C65A16] px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                        {offence.law_code}
                      </span>

                      <span className="text-sm font-semibold text-[#4A2A1A]">
                        Section {offence.section}
                      </span>

                    </div>


                    {/* Offence name */}
                    <p className="mt-2 text-base font-medium leading-snug text-[#2B170D] group-hover:text-[#A94B12]">
                      {offence.offence_name}
                    </p>

                  </div>


                  {/* Punishment */}
                  <div className="flex-shrink-0 text-right">

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#806F64]">
                      Maximum
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#5E4B40]">
                      {formatMaxPunishment(offence)}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}


      {/* ========================================================
          NO RESULTS
      ========================================================= */}

      {isOpen &&
        results.length === 0 &&
        !loading &&
        query.length > 0 && (
          <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#D8B9A0] bg-white px-5 py-5 shadow-xl">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0F0] text-[#B94343]">

                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >

                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l-1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />

                </svg>

              </div>


              <div>

                <p className="text-base font-semibold text-[#2B170D]">
                  No matching offence
                </p>

                <p className="mt-1 text-sm text-[#806F64]">

                  No configured offence matches{' '}

                  <span className="font-medium text-[#5E4B40]">
                    "{query}"
                  </span>

                </p>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default OffenceSearch;