import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MacroHistoryChart from './MacroHistoryChart';

export default function MealHistoryPanel({ onClose }) {
  const { getHistory, getHistoryStats, shareHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('history');
  const [sharingId, setSharingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    Promise.all([
      getHistory().then(d => setHistory(d.history || [])),
      getHistoryStats().then(d => setStats(d.stats || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getHistory, getHistoryStats]);

  const handleShare = async (entry) => {
    setSharingId(entry.id);
    try {
      const data = await shareHistory(entry.id);
      const url = `${window.location.origin}?share=${data.shareToken}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
    setSharingId(null);
  };

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

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-2 bg-white sticky top-[73px] z-10">
          {['history', 'chart'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 ${
                tab === t ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'chart' ? 'Macro Trends' : 'History'}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : tab === 'chart' ? (
            stats.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📈</div>
                <p className="font-semibold text-gray-700">No data yet</p>
                <p className="text-sm text-gray-400 mt-1">Generate a few meal plans to see trends</p>
              </div>
            ) : (
              <MacroHistoryChart stats={stats} />
            )
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
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-bold text-emerald-600">{entry.calories}</span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">kcal</p>
                      </div>
                      <button
                        onClick={() => handleShare(entry)}
                        disabled={sharingId === entry.id}
                        title="Copy share link"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                      >
                        {copiedId === entry.id ? (
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        )}
                      </button>
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
