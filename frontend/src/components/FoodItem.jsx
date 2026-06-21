function Badge({ label, color }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors[color] || colors.green}`}>
      {label}
    </span>
  );
}

export default function FoodItem({ item }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
          {item.isVegan && <Badge label="Vegan" color="green" />}
          {item.isVegetarian && !item.isVegan && <Badge label="Veg" color="green" />}
          {item.isGlutenFree && <Badge label="GF" color="yellow" />}
          {item.isHalal && <Badge label="Halal" color="blue" />}
          {item.isKosher && <Badge label="Kosher" color="purple" />}
        </div>
        {item.servingSize && (
          <p className="text-xs text-gray-400 mb-1">{item.servingSize}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{item.calories} cal</span>
          <span>P <strong className="text-gray-700">{item.protein}g</strong></span>
          <span>C <strong className="text-gray-700">{item.carbs}g</strong></span>
          <span>F <strong className="text-gray-700">{item.fat}g</strong></span>
          {item.fiber > 0 && <span>Fiber <strong className="text-gray-700">{item.fiber}g</strong></span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-lg font-bold text-gray-800">{item.calories}</span>
        <p className="text-xs text-gray-400 leading-none">cal</p>
      </div>
    </div>
  );
}
