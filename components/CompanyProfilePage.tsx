import React from 'react';
import { ArrowLeft, Building2, ShieldCheck, Globe, FileText, Lock, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import type { Job } from '../App';

interface CompanyProfilePageProps {
  job: Job;
  onBack: () => void;
}

const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ job, onBack }) => {
  
  const getMaskedCIN = (cin?: string) => {
    if (!cin || cin.length < 10) return "U74999******";
    return `${cin.substring(0, 6)}***********${cin.substring(cin.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm mb-6"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
               <div className="absolute inset-0 bg-white/5 pattern-grid-lg"></div>
            </div>
            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-end gap-6">
                        <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-lg shrink-0">
                            <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                                <Building2 size={48} className="text-gray-400" />
                            </div>
                        </div>
                        <div className="mb-2">
                             <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.companyName}</h1>
                             {job.isVerified && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck size={14} /> Verified Employer
                                </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {job.companyWebsite ? (
                            <a 
                                href={job.companyWebsite.startsWith('http') ? job.companyWebsite : `https://${job.companyWebsite}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            >
                                <Globe size={16} /> Visit Website
                            </a>
                        ) : (
                             <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-400 cursor-not-allowed">
                                <Globe size={16} /> Website Private
                             </button>
                        )}
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
                     <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{job.location} (Headquarters)</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>Email Verified</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 size={16} />
                            <span>100% Scam-Free Guarantee</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-8">
                
                {/* About Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-blue-500" />
                        About {job.companyName}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        {job.companyDescription || `${job.companyName} is a verified employer on SafeHire India. They have passed our rigorous verification process including CIN and GST validation to ensure a safe job seeking experience for all candidates.`}
                    </p>
                    
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                             <div className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Industry</div>
                             <div className="font-semibold text-gray-900">Technology & Services</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                             <div className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">Company Type</div>
                             <div className="font-semibold text-gray-900">Private Limited</div>
                        </div>
                    </div>
                </div>

                {/* Safety Badge */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-6 flex items-start gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-emerald-900 mb-1">SafeHire Verified Partner</h3>
                        <p className="text-emerald-800 text-sm opacity-90 leading-relaxed">
                            This company has submitted official government documents (CIN/GST) and passed our physical address verification checks. You can apply to their jobs with 100% confidence.
                        </p>
                    </div>
                </div>

            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                
                {/* Verification Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                        Government Verification
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                             <div className="flex items-center gap-2 mb-1">
                                <FileText size={14} className="text-blue-600" />
                                <span className="text-xs font-bold text-gray-700">CIN Number</span>
                             </div>
                             <p className="text-sm font-mono text-gray-900 flex items-center gap-2 font-medium">
                                {getMaskedCIN(job.companyCin)}
                                <Lock size={12} className="text-gray-400" title="Partially masked" />
                             </p>
                             <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-700">
                                <CheckCircle2 size={10} /> Validated against MCA records
                             </div>
                        </div>

                        <div className="flex items-center gap-3 p-2">
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                 <CheckCircle2 size={16} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-gray-900">GST Registered</p>
                                 <p className="text-[10px] text-gray-500">Active Taxpayer Status</p>
                             </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-2">
                             <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                 <Building2 size={16} />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-gray-900">Address Verified</p>
                                 <p className="text-[10px] text-gray-500">Physical Location Checked</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Report Section */}
                 <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-3">Notice something suspicious?</p>
                    <button className="text-red-600 text-sm font-bold hover:underline">
                        Report this Company
                    </button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfilePage;