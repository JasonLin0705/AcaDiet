export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center min-w-0">
            <div className={`
              relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${i < current
                ? 'bg-emerald-500 text-white shadow-md'
                : i === current
                ? 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-100'
                : 'bg-gray-100 text-gray-400'}
            `}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`mt-1.5 text-xs font-medium whitespace-nowrap ${i <= current ? 'text-gray-800' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 mx-2 mb-4">
              <div className="h-0.5 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full bg-emerald-500 transition-all duration-500 ${i < current ? 'w-full' : 'w-0'}`} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
