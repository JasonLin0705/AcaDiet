import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import UniversitySearch from './components/UniversitySearch';
import GoalForm from './components/GoalForm';
import DiningHallSelect from './components/DiningHallSelect';
import MealPlanDisplay from './components/MealPlanDisplay';
import { generateMealPlan } from './services/api';

const STEPS = ['University', 'Goals', 'Dining Halls', 'Meal Plan'];

function AppContent() {
  const { user, saveGoals, saveHistory } = useAuth() as any;
  const [step, setStep] = useState(0);
  const [university, setUniversity] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [hallSelections, setHallSelections] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const handleUniversitySelect = (uni: any) => {
    setUniversity(uni);
    setStep(1);
  };

  const handleGoalsSubmit = useCallback(async ({ goals: g, restrictions: r }: any) => {
    setGoals(g);
    setRestrictions(r);
    if (user) {
      try { await saveGoals({ ...g, restrictions: r }); } catch {}
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
      setStep(3);
      if (user && plan.totals) {
        const hallNames = [breakfastHall?.name, lunchHall?.name, dinnerHall?.name]
          .filter(Boolean)
          .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
        try {
          await saveHistory({
            date: new Date().toISOString().split('T')[0],
            school: university.name,
            hallName: hallNames.join(' + '),
            plan,
            totals: plan.totals,
          });
        } catch {}
      }
    } catch (err: any) {
      const msg = err.noMenuData
        ? "No menu data available. These dining halls may be closed or menus haven't been published yet."
        : (err.message || 'Failed to generate meal plan');
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
  };

  // Pre-populate goals from saved user preferences
  const initialGoals = user?.goals ? {
    calories: user.goals.calories,
    protein: user.goals.protein,
    carbs: user.goals.carbs,
    fat: user.goals.fat,
    restrictions: user.goals.restrictions || [],
  } : null;

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
            <span><strong>Error:</strong> {genError}</span>
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
