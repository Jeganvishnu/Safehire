import React from 'react';
import { Shield, Eye, FileCheck, AlertTriangle, CheckCircle2, Building2, UserCheck } from 'lucide-react';

interface HowItWorksSectionProps {
  isPreview?: boolean;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ isPreview = false }) => {
  
  if (isPreview) {
      // Condensed version for Home Page
      return (
        <section className="py-20 bg-white">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">How SafeHire Protects You</h2>
                  <p className="text-gray-600">Overview of our protection system</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                       { icon: Shield, title: "Company Verification", desc: "CIN & GST checks", color: "text-emerald-600 bg-emerald-100" },
                       { icon: Eye, title: "AI Fraud Scan", desc: "Auto-detect scams", color: "text-blue-600 bg-blue-100" },
                       { icon: FileCheck, title: "Manual Review", desc: "Admin approved", color: "text-purple-600 bg-purple-100" },
                       { icon: AlertTriangle, title: "Community Report", desc: "User protection", color: "text-amber-600 bg-amber-100" }
                   ].map((item, i) => (
                       <div key={i} className="p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.color}`}>
                               <item.icon size={24} />
                           </div>
                           <h3 className="font-bold text-gray-900">{item.title}</h3>
                           <p className="text-gray-500 text-sm">{item.desc}</p>
                       </div>
                   ))}
               </div>
           </div>
        </section>
      );
  }

  // Full Page Version
  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 py-16 md:py-20 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 border border-white/30">
            <Shield size={18} />
            <span className="font-semibold text-sm tracking-wide">TRUSTED BY 10,000+ JOB SEEKERS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">How SafeHire Works</h1>
          <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            India's first AI-powered, scam-free job platform protecting job seekers from fraud through government-standard verification.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-24">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Multi-Layer Protection System</h2>
        </div>

        {/* Step 1: Company Verification */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
               <FileCheck size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">1. Company Verification</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Every employer must provide valid CIN (Corporate Identity Number) and GST numbers. We verify these against government databases using automated API checks.
            </p>
            <ul className="space-y-3">
              {[
                "CIN format validation (21-character format)",
                "GST number structure verification",
                "Email domain must match company website",
                "No free email providers allowed (gmail, yahoo, etc.)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/2">
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Building2 size={120} />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="w-12 h-12 bg-gray-100 rounded-lg"></div>
                   <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Company Verified
                   </div>
                </div>
                <div className="space-y-4 relative z-10">
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-400 text-sm font-medium">CIN:</span>
                      <span className="text-gray-800 text-sm font-mono">U74999DL2020PTC123456</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-400 text-sm font-medium">GST:</span>
                      <span className="text-emerald-600 text-sm font-mono">22AAAAA0000A1Z5</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-400 text-sm font-medium">Email:</span>
                      <span className="text-gray-800 text-sm">hr@company.com</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-400 text-sm font-medium">Website:</span>
                      <span className="text-blue-500 text-sm">company.com</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Step 2: AI Fraud Detection */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
               <Eye size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">2. AI Fraud Detection</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
               Our AI analyzes every job post before it goes live, scanning for scam patterns and red flags that indicate potential fraud.
            </p>
            <ul className="space-y-3">
              {[
                "Payment requests (fees, deposits, charges)",
                "Unrealistic salaries or promises",
                "Poor grammar indicating copy-paste scams",
                "Pressure tactics (urgent, limited slots)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/2">
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                   AI Analysis Result:
                </h4>
                
                <div className="mb-6">
                   <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-gray-500">Fraud Probability</span>
                      <span className="text-emerald-600">Risk: Low (15/100)</span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[15%] bg-emerald-500 rounded-full"></div>
                   </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      No payment requests detected
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Realistic salary range
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Professional language used
                   </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
                   <span className="text-emerald-700 font-bold text-sm">Decision: APPROVED</span>
                </div>
             </div>
          </div>
        </div>

        {/* Step 3: Community Protection */}
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 space-y-6">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
               <UserCheck size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">3. Community Protection</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
               Job seekers can report suspicious jobs. Our team investigates all reports and bans repeat offenders permanently.
            </p>
            <ul className="space-y-3">
              {[
                "One-click reporting system",
                "Admin review within 24 hours",
                "Permanent ban for confirmed scammers",
                "Pattern tracking to detect repeat attempts"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/2">
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Report Fraud</h4>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Reason</label>
                      <div className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm">
                         Job asks for registration fee
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                      <div className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm min-h-[80px]">
                         They asked me to pay ₹5000 for training before joining
                      </div>
                   </div>
                   <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                      Submit Report
                   </button>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorksSection;