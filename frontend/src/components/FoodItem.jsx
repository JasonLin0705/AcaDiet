export default function FoodItem({ item }) {
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
    </div>
  );
}
