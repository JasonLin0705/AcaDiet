import { useState, useEffect } from 'react';
import { getDiningHalls } from '../services/api';

export default function DiningHallSelect({ university, goals, restrictions, onSelect, onBack, loading: parentLoading }) {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notOnNutrislice, setNotOnNutrislice] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotOnNutrislice(false);
    getDiningHalls(university.subdomain)
      .then((data) => {
        if (!cancelled) setHalls(data.halls || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setNotOnNutrislice(err.notOnNutrislice || false);
          setError(err.message || 'Failed to load dining halls');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [university.subdomain]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading dining halls for <strong>{university.fullName}</strong>...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {notOnNutrislice ? 'School not on Nutrislice' : 'Connection error'}
          </h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>

        {notOnNutrislice && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-700">Your university may use an alternative dining system:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li><strong>Cbord / GET Mobile</strong> — common at large state universities</li>
              <li><strong>Transact / Bite</strong> — used by several private schools</li>
              <li><strong>EAT@</strong> — found at some UC campuses</li>
            </ul>
            <p className="text-gray-500 mt-2">Check your university's dining website for menu access.</p>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Try a different university
        </button>
      </div>
    );
  }

  if (halls.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500">No dining halls found for this school.</p>
        <button onClick={onBack} className="mt-4 text-green-600 hover:underline text-sm font-medium">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose a dining hall</h2>
        <p className="text-gray-500 text-sm">
          Select a dining hall at <strong>{university.fullName}</strong> to generate today's meal plan.
        </p>
      </div>

      <div className="grid gap-3">
        {halls.map((hall) => (
          <button
            key={hall.slug}
            onClick={() => !parentLoading && onSelect(hall)}
            disabled={parentLoading}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-green-300 hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-wait"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {hall.name}
                </div>
                {hall.menuTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {hall.menuTypes.map((mt) => {
                      const label = typeof mt === 'string' ? mt : (mt.label || mt.slug || '');
                      const key = typeof mt === 'string' ? mt : (mt.slug || mt.label || '');
                      return (
                        <span
                          key={key}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {parentLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm font-medium">Generating your optimized meal plan...</p>
        </div>
      )}

      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        ← Back to nutrition goals
      </button>
    </div>
  );
}
