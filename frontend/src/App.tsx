import { useState, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import UniversitySearch from './components/UniversitySearch';
import GoalForm from './components/GoalForm';
import DiningHallSelect from './components/DiningHallSelect';
import MealPlanDisplay from './components/MealPlanDisplay';
import SharedPlanView from './components/SharedPlanView';
import { generateMealPlan } from './services/api';

const STEPS = ['University', 'Goals', 'Dining Halls', 'Meal Plan'];

function AppContent() {
  const { user, loading, saveGoals, saveHistory, getFavorites, addFavorite, removeFavorite, shareHistory } = useAuth();
  const [step, setStep] = useState(0);
  const [university, setUniversity] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [hallSelections, setHallSelections] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [planHistoryId, setPlanHistoryId] = useState<string | null>(null);
  const [sharedPlan, setSharedPlan] = useState<any>(null);
  const [sharedPlanLoading, setSharedPlanLoading] = useState(false);
  const [sharedPlanError, setSharedPlanError] = useState<string | null>(null);

  // Check for ?share=TOKEN on initial load
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('share');
    if (!token) return;
    setSharedPlanLoading(true);
    fetch(`/api/share/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setSharedPlanError(data.error); return; }
        const plan = data.plan || {};
        setSharedPlan({
          school: data.school,
          date: data.date,
          hallName: data.hallName,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          breakfast: plan.breakfast || [],
          lunch: plan.lunch || [],
          dinner: plan.dinner || [],
        });
      })
      .catch(() => setSharedPlanError('Failed to load shared plan'))
      .finally(() => setSharedPlanLoading(false));
  }, []);

  // Auto-restore university from localStorage when logged in with goals
  useEffect(() => {
    if (loading || !user || university !== null) return;
    if (!user.goals) return;
    const saved = localStorage.getItem('acadiet_university');
    if (!saved) return;
    try {
      const uni = JSON.parse(saved);
      setUniversity(uni);
      setGoals(user.goals);
      setRestrictions(user.goals.restrictions || []);
      setStep(2);
    } catch {}
  }, [loading, user, university]);

  // Load favorites when user logs in
  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    getFavorites().then((d: any) => setFavorites(d.favorites || [])).catch(() => {});
  }, [user, getFavorites]);

  const handleUniversitySelect = (uni: any) => {
    setUniversity(uni);
    localStorage.setItem('acadiet_university', JSON.stringify(uni));
    setStep(1);
  };

  const handleGoalsSubmit = useCallback(async ({ goals: g, restrictions: r }: any) => {
    setGoals(g);
    setRestrictions(r);
    if (user) {
      try { await saveGoals({ ...g, restrictions: r }); } catch (err) {
        console.error('Failed to save goals:', err);
      }
    }
    setStep(2);
  }, [user, saveGoals]);

  const handleMultiHallGenerate = useCallback(async ({ breakfastHall, lunchHall, dinnerHall }: any) => {
    setHallSelections({ breakfastHall, lunchHall, dinnerHall });
    setGenerating(true);
    setGenError(null);
    try {
      const plan = await generateMealPlan({
        school: university.subdomain,
        date: null,
        goals,
        restrictions,
        breakfastHall,
        lunchHall,
        dinnerHall,
      });
      setMealPlan(plan);
      setPlanHistoryId(null);
      setStep(3);
      if (user && plan.totals) {
        const hallNames = [breakfastHall?.name, lunchHall?.name, dinnerHall?.name]
          .filter(Boolean)
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
        try {
          const result: any = await saveHistory({
            date: new Date().toISOString().split('T')[0],
            school: university.name,
            hallName: hallNames.join(' + '),
            plan,
            totals: plan.totals,
          });
          if (result?.entry?.id) setPlanHistoryId(result.entry.id);
        } catch (err) {
          console.error('Failed to save history:', err);
        }
      }
    } catch (err: any) {
      let msg: string;
      if (err.noMenuData) {
        msg = "No menu data found for today. These dining halls may be closed or menus haven't been published yet.";
      } else if (!err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
        msg = "Can't reach the server. Check your connection and try again.";
      } else {
        msg = err.response?.data?.error || err.message || 'Failed to generate meal plan';
      }
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  }, [university, goals, restrictions, user, saveHistory]);

  const handleRegenerate = useCallback(async () => {
    if (!hallSelections) return;
    setGenerating(true);
    setGenError(null);
    try {
      const plan = await generateMealPlan({
        school: university.subdomain,
        date: null,
        goals,
        restrictions,
        ...hallSelections,
      });
      setMealPlan(plan);
      setPlanHistoryId(null);
    } catch (err: any) {
      setGenError(err.message || 'Failed to regenerate');
    } finally {
      setGenerating(false);
    }
  }, [university, goals, restrictions, hallSelections]);

  const handleStartOver = () => {
    setStep(0);
    setUniversity(null);
    setGoals(null);
    setRestrictions([]);
    setHallSelections(null);
    setMealPlan(null);
    setGenError(null);
    setPlanHistoryId(null);
    localStorage.removeItem('acadiet_university');
  };

  const handleToggleFavorite = useCallback(async (item: any) => {
    if (!user) return;
    const isFav = favorites.some((f: any) => f.foodId === String(item.id));
    if (isFav) {
      await removeFavorite(String(item.id)).catch(() => {});
      setFavorites(prev => prev.filter((f: any) => f.foodId !== String(item.id)));
    } else {
      await addFavorite(item).catch(() => {});
      setFavorites(prev => [...prev, { foodId: String(item.id), foodName: item.name }]);
    }
  }, [user, favorites, addFavorite, removeFavorite]);

  const handleShare = useCallback(async () => {
    if (!planHistoryId) return null;
    const data: any = await shareHistory(planHistoryId);
    return `${window.location.origin}?share=${data.shareToken}`;
  }, [planHistoryId, shareHistory]);

  const initialGoals = user?.goals ? {
    calories: user.goals.calories,
    protein: user.goals.protein,
    carbs: user.goals.carbs,
    fat: user.goals.fat,
    restrictions: user.goals.restrictions || [],
  } : null;

  // Shared plan view
  if (sharedPlanLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading shared plan…</p>
        </div>
      </div>
    );
  }

  if (sharedPlanError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/40 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-sm w-full text-center shadow-sm">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-bold text-gray-900 mb-1">Plan not found</p>
          <p className="text-sm text-gray-500 mb-5">This link may have expired or been removed.</p>
          <button
            onClick={() => { window.history.replaceState({}, '', '/'); setSharedPlanError(null); }}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
          >
            Go to AcaDiet
          </button>
        </div>
      </div>
    );
  }

  if (sharedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/40">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8 pb-20">
          <SharedPlanView sharedPlan={sharedPlan} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/40">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <div className="mb-8">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {genError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <span><strong>Error:</strong> {genError}</span>
              {hallSelections && (
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="ml-2 underline font-semibold hover:text-red-900 disabled:opacity-50"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {step === 0 && <UniversitySearch onSelect={handleUniversitySelect} />}
        {step === 1 && (
          <GoalForm
            onSubmit={handleGoalsSubmit}
            onBack={() => setStep(0)}
            initialGoals={initialGoals}
            initialRestrictions={initialGoals?.restrictions || []}
          />
        )}
        {step === 2 && (
          <DiningHallSelect
            university={university}
            goals={goals}
            restrictions={restrictions}
            onGenerate={handleMultiHallGenerate}
            onBack={() => setStep(1)}
            loading={generating}
          />
        )}
        {step === 3 && mealPlan && (
          <MealPlanDisplay
            plan={mealPlan}
            goals={goals}
            university={university}
            hallSelections={hallSelections}
            onRegenerate={handleRegenerate}
            onStartOver={handleStartOver}
            generating={generating}
            favorites={user ? favorites : undefined}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onShare={planHistoryId ? handleShare : undefined}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
