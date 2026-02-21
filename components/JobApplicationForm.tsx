import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  UploadCloud, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  X
} from 'lucide-react';
import type { Job } from '../App';

interface JobApplicationFormProps {
  job: Job;
  onCancel: () => void;
  onSubmit: (data: ApplicationFormData) => void;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  resume: File | null;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ job, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        e.target.value = ''; // Reset input
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.resume) {
      alert('Please upload your resume (PDF).');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      
      {/* Header / Back */}
      <div className="w-full max-w-2xl mb-6">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Job Summary Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Apply for {job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-emerald-50 text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 size={16} /> {job.companyName}
            </span>
            <span className="opacity-50">|</span>
            <span>{job.location}</span>
            <span className="opacity-50">|</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold">
              {job.type}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Resume / CV (PDF Only) <span className="text-red-500">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${formData.resume ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden" 
                  id="resume-upload"
                  required 
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  {formData.resume ? (
                    <>
                      <FileText size={32} className="text-emerald-600" />
                      <div>
                        <p className="text-sm font-bold text-emerald-800">{formData.resume.name}</p>
                        <p className="text-xs text-emerald-600">{(formData.resume.size / 1024).toFixed(0)} KB • Click to change</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={32} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Click to upload Resume</p>
                        <p className="text-xs text-gray-400">PDF Format only (Max 5MB)</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 flex gap-4">
               <button
                 type="button"
                 onClick={onCancel}
                 className="flex-1 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                 disabled={isSubmitting}
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isSubmitting ? (
                   <>Processing...</>
                 ) : (
                   <>
                     Submit Application
                     <CheckCircle2 size={18} />
                   </>
                 )}
               </button>
            </div>
            
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 mt-4">
              <ShieldCheck size={12} className="text-emerald-500" />
              Your data is shared securely only with {job.companyName}
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;