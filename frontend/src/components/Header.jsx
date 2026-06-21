import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import MealHistoryPanel from './MealHistoryPanel';

export default function Header() {
  const { user, logout } = useAuth();
  const [modal, setModal] = useState(null); // 'login' | 'register' | 'history' | null
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <>
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 backdrop-blur border border-white/20 rounded-xl flex items-center justify-center text-white text-lg font-bold select-none">
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none tracking-tight">AcaDiet</h1>
              <p className="text-[11px] text-emerald-300 mt-0.5">Smart dining hall meals</p>
            </div>
          </div>

          {/* Auth controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-3 py-2 transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-300 to-emerald-400 rounded-full flex items-center justify-center text-emerald-900 text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block">{user.firstName}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); setModal('history'); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Meal History</span>
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => setModal('login')}
                  className="text-emerald-100 hover:text-white text-sm font-medium px-3 py-2 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  Log in
                </button>
                <button
                  onClick={() => setModal('register')}
                  className="bg-white text-emerald-800 text-sm font-bold px-4 py-2 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-sm"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onSwitchToRegister={() => setModal('register')}
        />
      )}
      {modal === 'register' && (
        <RegisterModal
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal('login')}
        />
      )}
      {modal === 'history' && (
        <MealHistoryPanel onClose={() => setModal(null)} />
      )}
    </>
  );
}
