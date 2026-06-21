import { useState, useEffect } from 'react';
import { getDiningHalls } from '../services/api';
import MultiHallSelect from './MultiHallSelect';

export default function DiningHallSelect({ university, goals, restrictions, onGenerate, onBack, loading }) {
  const [halls, setHalls] = useState([]);
  const [loadingHalls, setLoadingHalls] = useState(true);
  const [error, setError] = useState(null);
  const [notOnNutrislice, setNotOnNutrislice] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingHalls(true);
    setError(null);
    setNotOnNutrislice(false);
    getDiningHalls(university.subdomain)
      .then(data => { if (!cancelled) setHalls(data.halls || []); })
      .catch(err => {
        if (!cancelled) {
          setNotOnNutrislice(err.notOnNutrislice || false);
          setError(err.message || 'Failed to load dining halls');
        }
      })
      .finally(() => { if (!cancelled) setLoadingHalls(false); });
    return () => { cancelled = true; };
  }, [university.subdomain]);

  if (loadingHalls) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-14 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-emerald-100 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium">Loading dining halls</p>
          <p className="text-gray-400 text-sm mt-1">for <strong>{university.fullName}</strong></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {notOnNutrislice ? 'School not on Nutrislice' : 'Connection error'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        {notOnNutrislice && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 text-left space-y-1">
            <p className="font-semibold text-gray-700">Your school may use a different system:</p>
            <ul className="list-disc list-inside text-gray-500 space-y-1 mt-2">
              <li><strong>Cbord / GET Mobile</strong> — common at large state schools</li>
              <li><strong>Transact / Bite</strong> — used by several private schools</li>
            </ul>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <div className="text-4xl mb-4">🍽</div>
        <p className="text-gray-600 font-medium">No dining halls found</p>
        <p className="text-gray-400 text-sm mt-1 mb-5">for {university.fullName}</p>
        <button onClick={onBack} className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold hover:underline">
          ← Try another university
        </button>
      </div>
    );
  }

  return (
    <MultiHallSelect
      university={university}
      halls={halls}
      goals={goals}
      restrictions={restrictions}
      onGenerate={onGenerate}
      onBack={onBack}
      loading={loading}
    />
  );
}
