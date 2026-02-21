import React, { useState } from 'react';
import { Shield, Menu, X, Building2, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  onNavigate: (view: 'home' | 'jobs' | 'how-it-works' | 'login' | 'employer-dashboard' | 'my-applications' | 'admin-dashboard') => void;
  isLoggedIn: boolean;
  userRole: 'job-seeker' | 'employer' | 'admin';
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, isLoggedIn, userRole, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (view: 'home' | 'jobs' | 'how-it-works' | 'login' | 'employer-dashboard' | 'my-applications' | 'admin-dashboard') => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  // --- Strict Visibility Logic ---
  // 1. Find Jobs: Visible to Guest, Job Seeker, and Admin. HIDDEN for Employers.
  const showFindJobs = !isLoggedIn || userRole === 'job-seeker' || userRole === 'admin';

  // 2. Employer Dashboard: Visible to Employer and Admin.
  const showEmployerBoard = isLoggedIn && (userRole === 'employer' || userRole === 'admin');
  
  // 3. My Applications: Visible to Job Seeker and Admin. HIDDEN for Employers.
  const showMyApps = isLoggedIn && (userRole === 'job-seeker' || userRole === 'admin');
  
  // 4. Admin Dashboard: Visible to Admin only.
  const showAdminBoard = isLoggedIn && userRole === 'admin';

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => handleNavigate('home')}
          >
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-gray-900">SafeHire India</span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">100% Scam-Free</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 items-center">
              {showFindJobs && (
                <button 
                  onClick={() => handleNavigate('jobs')} 
                  className="text-gray-600 hover:text-emerald-600 font-medium transition-colors focus:outline-none"
                >
                  Find Jobs
                </button>
              )}
              
              <button 
                onClick={() => handleNavigate('how-it-works')} 
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors focus:outline-none"
              >
                How It Works
              </button>

              {isLoggedIn ? (
                <>
                  {showAdminBoard && (
                    <button 
                      onClick={() => handleNavigate('admin-dashboard')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Admin
                    </button>
                  )}

                  {showEmployerBoard && (
                    <button 
                      onClick={() => handleNavigate('employer-dashboard')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Building2 size={16} className="text-gray-500" />
                      Employer Dashboard
                    </button>
                  )}
                  
                  {showMyApps && (
                    <button 
                      onClick={() => handleNavigate('my-applications')}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Briefcase size={16} className="text-gray-500" />
                      My Applications
                    </button>
                  )}

                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors ml-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleNavigate('login')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-md transition-all shadow-sm ml-2"
                >
                  Login / Register
                </button>
              )}
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-emerald-600 p-2 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {showFindJobs && (
              <button 
                onClick={() => handleNavigate('jobs')} 
                className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Find Jobs
              </button>
            )}
            
            <button 
              onClick={() => handleNavigate('how-it-works')} 
              className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              How It Works
            </button>
            
            <div className="pt-2 border-t border-gray-100 mt-2">
              {isLoggedIn ? (
                <>
                   {showAdminBoard && (
                    <button 
                      onClick={() => handleNavigate('admin-dashboard')}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  {showEmployerBoard && (
                    <button 
                      onClick={() => handleNavigate('employer-dashboard')}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Employer Dashboard
                    </button>
                  )}
                  
                  {showMyApps && (
                    <button 
                      onClick={() => handleNavigate('my-applications')}
                      className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      My Applications
                    </button>
                  )}
                  
                  <button 
                    onClick={onLogout}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleNavigate('login')}
                  className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg text-center transition-all"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;