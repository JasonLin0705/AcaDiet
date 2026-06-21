export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-lg font-bold select-none">
          A
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-none">AcaDiet</h1>
          <p className="text-xs text-gray-500 mt-0.5">Optimize your dining hall meals</p>
        </div>
      </div>
    </header>
  );
}
