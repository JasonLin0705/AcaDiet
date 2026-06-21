import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MealHistoryPanel({ onClose }) {
  const { getHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getHistory]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Meal History</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your past generated plans</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🍽</div>
              <p className="font-semibold text-gray-700">No meal history yet</p>
              <p className="text-sm text-gray-400 mt-1">Generate a meal plan to save it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map(entry => (
                <div key={entry.id} className="bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-2xl p-4 transition-all cursor-default">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{entry.hallName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{entry.school}</p>
                      <p className="text-xs text-gray-400">{entry.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-emerald-600">{entry.calories}</span>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs pt-2 border-t border-gray-200">
                    <div>
                      <span className="text-blue-600 font-bold">{Math.round(entry.protein)}g</span>
                      <span className="text-gray-400 ml-0.5">protein</span>
                    </div>
                    <div>
                      <span className="text-orange-500 font-bold">{Math.round(entry.carbs)}g</span>
                      <span className="text-gray-400 ml-0.5">carbs</span>
                    </div>
                    <div>
                      <span className="text-purple-600 font-bold">{Math.round(entry.fat)}g</span>
                      <span className="text-gray-400 ml-0.5">fat</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
