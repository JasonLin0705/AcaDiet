import { useState, useRef, useEffect } from 'react';
import { searchUniversities } from '../services/api';

export default function UniversitySearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customSubdomain, setCustomSubdomain] = useState('');
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchUniversities(val.trim());
        setResults(data.universities || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (school) => {
    setQuery(school.fullName);
    setResults([]);
    setOpen(false);
    onSelect(school);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const sub = customSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (!sub) return;
    onSelect({
      name: sub,
      subdomain: sub,
      fullName: `${sub}.nutrislice.com`,
      isCustom: true,
    });
  };

  const avatarColor = (name) => {
    const colors = [
      'bg-emerald-500', 'bg-blue-500', 'bg-violet-500',
      'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      {/* Hero heading */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Find your university</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Search for your school and we'll load today's dining hall menus.
        </p>
      </div>

      {/* Search */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {loading ? (
              <svg className="w-5 h-5 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder="e.g. UCLA, Stanford, UW Madison..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm font-medium shadow-sm"
          />
        </div>

        {/* Results dropdown */}
        {open && results.length > 0 && (
          <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
            {results.map((school, idx) => (
              <li key={school.subdomain} className={idx > 0 ? 'border-t border-gray-50' : ''}>
                <button
                  onMouseDown={() => handleSelect(school)}
                  className="w-full text-left px-4 py-3.5 hover:bg-emerald-50 transition-colors duration-150 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 ${avatarColor(school.name)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{school.fullName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{school.subdomain}.nutrislice.com</div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && !loading && query.length >= 2 && results.length === 0 && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-sm text-gray-500 text-center">
            No universities found for "<span className="font-medium text-gray-700">{query}</span>"
          </div>
        )}
      </div>

      {/* Custom subdomain */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            My school isn't listed — enter subdomain manually
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-1">
            <p className="text-sm text-gray-500 mb-2.5">
              Enter your school's Nutrislice subdomain (e.g.{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded-md text-xs font-mono text-gray-700">mit</code>{' '}
              for mit.nutrislice.com)
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 shadow-sm">
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  placeholder="subdomain"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none font-medium"
                />
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-l border-gray-200 select-none font-mono">
                  .nutrislice.com
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Try
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Note */}
      <div className="mt-5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Note:</strong> Only schools using Nutrislice will work here. Schools on Cbord, Transact, or EAT@ won't appear. Check your university's dining website to confirm.
        </p>
      </div>
    </div>
  );
}
