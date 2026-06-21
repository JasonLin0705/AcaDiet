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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Find your university</h2>
        <p className="text-gray-500 mt-1">
          Search for your school to load today's dining hall menus.
        </p>
      </div>

      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {loading ? (
              <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query.length >= 2 && setOpen(true)}
            placeholder="e.g. UCLA, Stanford, University of Michigan..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {open && results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((school) => (
              <li key={school.subdomain}>
                <button
                  onMouseDown={() => handleSelect(school)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                    {school.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{school.fullName}</div>
                    <div className="text-xs text-gray-400">{school.subdomain}.nutrislice.com</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && !loading && query.length >= 2 && results.length === 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-sm text-gray-500">
            No matching universities found.
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            My school isn't listed — enter subdomain manually
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="mt-2">
            <p className="text-sm text-gray-500 mb-2">
              Enter your school's Nutrislice subdomain (e.g. <code className="bg-gray-100 px-1 rounded">mit</code> for mit.nutrislice.com)
            </p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
                <input
                  type="text"
                  value={customSubdomain}
                  onChange={(e) => setCustomSubdomain(e.target.value)}
                  placeholder="subdomain"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                />
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-l border-gray-200 select-none">
                  .nutrislice.com
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Try
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Not all universities use Nutrislice. Schools on alternative systems (Cbord, Transact, EAT@) won't be available. Check your university's dining website to confirm.
        </p>
      </div>
    </div>
  );
}
