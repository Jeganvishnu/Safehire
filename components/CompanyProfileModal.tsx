import React from 'react';
import { X, Building2, ShieldCheck, Globe, FileText, Lock } from 'lucide-react';
import type { Job } from '../App';

interface CompanyProfileModalProps {
  job: Job;
  onClose: () => void;
}

const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({ job, onClose }) => {
  
  // Helper to mask CIN number (Show first 6, mask middle, show last 4)
  const getMaskedCIN = (cin?: string) => {
    if (!cin || cin.length < 10) return "U74999******";
    return `${cin.substring(0, 6)}***********${cin.substring(cin.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header with Pattern */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Building2 size={40} className="text-gray-800" />
                </div>
                <h2 className="text-2xl font-bold">{job.companyName}</h2>
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck size={14} /> Verified Employer
                </div>
            </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
            
            {/* CIN Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shrink-0">
                    <FileText size={20} />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Corporate Identity Number (CIN)</h3>
                    <p className="text-gray-900 font-mono font-medium flex items-center gap-2">
                        {getMaskedCIN(job.companyCin)}
                        <Lock size={12} className="text-gray-400" title="Partially masked for security" />
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Verified against Ministry of Corporate Affairs records</p>
                </div>
            </div>

            {/* Description */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">About the Company</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {job.companyDescription || `${job.companyName} is a verified employer on SafeHire India. They have passed our rigorous verification process including CIN and GST validation to ensure a safe job seeking experience.`}
                </p>
            </div>

            {/* Links */}
            <div className="pt-4 border-t border-gray-100">
                {job.companyWebsite ? (
                     <a 
                     href={job.companyWebsite.startsWith('http') ? job.companyWebsite : `https://${job.companyWebsite}`} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold rounded-lg transition-all"
                   >
                       <Globe size={18} />
                       Visit Official Website
                   </a>
                ) : (
                    <button disabled className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 border border-gray-200 text-gray-400 font-semibold rounded-lg cursor-not-allowed">
                        <Globe size={18} /> Website Not Public
                    </button>
                )}
            </div>
            
            <div className="text-center">
                 <p className="text-[10px] text-gray-400">
                    SafeHire India ID: {job.employerId.substring(0,8)}...
                 </p>
            </div>

        </div>

      </div>
    </div>
  );
};

export default CompanyProfileModal;