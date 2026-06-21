import { useState, useCallback } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import UniversitySearch from './components/UniversitySearch';
import GoalForm from './components/GoalForm';
import DiningHallSelect from './components/DiningHallSelect';
import MealPlanDisplay from './components/MealPlanDisplay';
import { generateMealPlan } from './services/api';

const STEPS = ['University', 'Goals', 'Dining Hall', 'Meal Plan'];

export default function App() {
  const [step, setStep] = useState(0);
  const [university, setUniversity] = useState<any>(null);
  const [goals, setGoals] = useState<any>(null);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [diningHall, setDiningHall] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const handleUniversitySelect = (uni: any) => {
    setUniversity(uni);
    setStep(1);
  };

  const handleGoalsSubmit = ({ goals: g, restrictions: r }: any) => {
    setGoals(g);
    setRestrictions(r);
    setStep(2);
  };

  const handleHallSelect = useCallback(async (hall: any) => {
    setDiningHall(hall);
    setGenerating(true);
    setGenError(null);
    try {
      const plan = await generateMealPlan({
        school: university.subdomain,
        hall: hall.slug,
        date: null,
        goals,
        restrictions,
        menuTypes: hall.menuTypes || [],
      });
      setMealPlan(plan);
      setStep(3);
    } catch (err: any) {
      setGenError(err.message || 'Failed to generate meal plan');
    } finally {
      setGenerating(false);
    }
  }, [university, goals, restrictions]);

  const handleRegenerate = useCallback(async () => {
    if (!diningHall) return;
    setGenerating(true);
    setGenError(null);
    try {
      const plan = await generateMealPlan({
        school: university.subdomain,
        hall: diningHall.slug,
        date: null,
        goals,
        restrictions,
        menuTypes: diningHall.menuTypes || [],
      });
      setMealPlan(plan);
    } catch (err: any) {
      setGenError(err.message || 'Failed to regenerate meal plan');
    } finally {
      setGenerating(false);
    }
  }, [university, diningHall, goals, restrictions]);

  const handleStartOver = () => {
    setStep(0);
    setUniversity(null);
    setGoals(null);
    setRestrictions([]);
    setDiningHall(null);
    setMealPlan(null);
    setGenError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <div className="mb-8">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {genError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            <strong>Error:</strong> {genError}
          </div>
        )}

        {step === 0 && <UniversitySearch onSelect={handleUniversitySelect} />}
        {step === 1 && (
          <GoalForm onSubmit={handleGoalsSubmit} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <DiningHallSelect
            university={university}
            goals={goals}
            restrictions={restrictions}
            onSelect={handleHallSelect}
            onBack={() => setStep(1)}
            loading={generating}
          />
        )}
        {step === 3 && mealPlan && (
          <MealPlanDisplay
            plan={mealPlan}
            goals={goals}
            university={university}
            diningHall={diningHall}
            onRegenerate={handleRegenerate}
            onStartOver={handleStartOver}
            generating={generating}
          />
        )}
      </main>
    </div>
  );
}
