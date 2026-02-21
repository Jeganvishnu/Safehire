import React from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Lock, 
  Building2, 
  UserCheck, 
  Ban
} from 'lucide-react';

interface HeroSectionProps {
  onFindJobs: () => void;
  onEmployerDashboard: () => void;
  isLoggedIn: boolean;
  userRole: 'job-seeker' | 'employer' | 'admin';
}

const HeroSection: React.FC<HeroSectionProps> = ({ onFindJobs, onEmployerDashboard, isLoggedIn, userRole }) => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mx-auto lg:mx-0">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Government-Style Verified Platform</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15]">
                India's First <br />
                <span className="text-emerald-500">100% Scam-Free</span> <br />
                Job Platform
              </h1>
            </div>

            <p className="text-lg text-gray-600 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Find verified jobs from trusted companies. No registration fees. No fraud. Protected by AI-powered scam detection.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onFindJobs}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center"
              >
                {isLoggedIn ? "Browse Verified Jobs" : "Find Jobs - 100% Free"}
              </button>
              
              <button 
                onClick={onEmployerDashboard}
                className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-emerald-500 font-bold py-3.5 px-8 rounded-lg transition-all text-center"
              >
                {isLoggedIn ? "Employer Dashboard" : "Post Jobs (Verified Companies)"}
              </button>
            </div>

            {/* Footer Features */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Zero Fees</h3>
                <p className="text-xs text-gray-500">For Job Seekers</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="w-8 h-8 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">AI Protected</h3>
                <p className="text-xs text-gray-500">Fraud Detection</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <div className="w-8 h-8 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Verified Only</h3>
                <p className="text-xs text-gray-500">Companies</p>
              </div>
            </div>
          </div>

          {/* Right Column: Alerts & Grid */}
          <div className="space-y-6">
            
            {/* Red Scam Alert Box */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <div className="bg-red-500 text-white p-2 rounded-lg shrink-0 shadow-sm mb-2 sm:mb-0">
                  <Ban size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-1">Zero Tolerance for Scams</h3>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>No employer can charge you money</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>All companies verified with CIN/GST</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>AI scans every job post before publishing</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Report suspicious jobs instantly</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Protection Grid */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Protection</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-emerald-50 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-emerald-100 transition-colors">
                  <div className="text-emerald-600 mb-1">
                    <CheckCircle2 size={28} />
                  </div>
                  <span className="text-2xl font-bold text-emerald-900">100%</span>
                  <span className="text-xs font-medium text-emerald-700">Free for Job Seekers</span>
                </div>

                {/* Card 2 */}
                <div className="bg-blue-50 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600 mb-1">
                    <Building2 size={28} />
                  </div>
                  <span className="text-2xl font-bold text-blue-900">CIN</span>
                  <span className="text-xs font-medium text-blue-700">Verified Companies</span>
                </div>

                {/* Card 3 */}
                <div className="bg-purple-50 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-purple-100 transition-colors">
                  <div className="text-purple-600 mb-1">
                    <Shield size={28} />
                  </div>
                  <span className="text-2xl font-bold text-purple-900">AI</span>
                  <span className="text-xs font-medium text-purple-700">Fraud Detection</span>
                </div>

                {/* Card 4 */}
                <div className="bg-amber-50 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-2 hover:bg-amber-100 transition-colors">
                  <div className="text-amber-700 mb-1">
                    <UserCheck size={28} />
                  </div>
                  <span className="text-2xl font-bold text-amber-900">Safe</span>
                  <span className="text-xs font-medium text-amber-800">Student-Friendly</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;