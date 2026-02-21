import React from 'react';

const SafetyGuaranteeSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Our Safety Guarantees
          </h2>
          <p className="text-emerald-100 opacity-90">
             Protecting job seekers is our top priority
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all group">
            <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
              0₹
            </div>
            <h3 className="text-lg font-bold mb-3">
              For Job Seekers
            </h3>
            <p className="text-emerald-50 text-xs leading-relaxed opacity-80">
              Completely free to search, apply, and get hired. No hidden charges ever.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all group">
            <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
              100%
            </div>
            <h3 className="text-lg font-bold mb-3">
              Verified Companies
            </h3>
            <p className="text-emerald-50 text-xs leading-relaxed opacity-80">
              Every employer verified with CIN and GST. No fake companies.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all group">
            <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
              AI
            </div>
            <h3 className="text-lg font-bold mb-3">
              Scam Detection
            </h3>
            <p className="text-blue-50 text-xs leading-relaxed opacity-80">
              Every job analyzed by AI before publishing. Auto-reject scams.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all group">
            <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
              24/7
            </div>
            <h3 className="text-lg font-bold mb-3">
              Protection
            </h3>
            <p className="text-blue-50 text-xs leading-relaxed opacity-80">
              Report suspicious jobs anytime. We investigate and take action.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SafetyGuaranteeSection;