export default function FoodItem({ item, isFavorite = false, onToggleFavorite, onSwap, swapping = false }) {
  const showVeg = item.isVegetarian && !item.isVegan;

  return (
    <div className="group flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</span>
          {item.isVegan && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700">Vegan</span>
          )}
          {showVeg && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">Veg</span>
          )}
          {item.isGlutenFree && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">GF</span>
          )}
          {item.isHalal && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">Halal</span>
          )}
          {item.isKosher && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-700">Kosher</span>
          )}
        </div>
        {item.servingSize && (
          <p className="text-[11px] text-gray-400 mb-1.5">{item.servingSize}</p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-800">{item.protein}g</span>
            <span className="text-[10px] text-blue-500 font-medium">protein</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-800">{item.carbs}g</span>
            <span className="text-[10px] text-orange-500 font-medium">carbs</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-800">{item.fat}g</span>
            <span className="text-[10px] text-purple-500 font-medium">fat</span>
          </div>
          {item.hallName && (
            <span className="text-[10px] text-gray-400 ml-auto">{item.hallName}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xl font-bold text-gray-900">{item.calories}</div>
        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">kcal</div>
      </div>
      {onSwap && (
        <button
          onClick={(e) => { e.stopPropagation(); onSwap(item); }}
          disabled={swapping}
          className="shrink-0 ml-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          aria-label="Swap for another item"
          title="Swap for another item"
        >
          <svg className={`w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors ${swapping ? 'animate-spin text-emerald-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
      {onToggleFavorite && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
          className="shrink-0 ml-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
