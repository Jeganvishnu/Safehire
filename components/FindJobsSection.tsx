import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, IndianRupee, ShieldCheck, Clock, AlertTriangle, CheckCircle2, Building2, Users, Ban, Calendar, Info } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Job } from '../App';

interface FindJobsSectionProps {
  jobs: Job[];
  onApply?: (jobId: string, jobTitle: string) => void;
  onCompanyClick?: (jobId: string) => void;
}

const FindJobsSection: React.FC<FindJobsSectionProps> = ({ jobs, onApply, onCompanyClick }) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('All Experience');
  const [bannedCompanies, setBannedCompanies] = useState<any[]>([]);

  useEffect(() => {
    // Listen to reports for Job Seeker flags
    const unsubscribeReports = onSnapshot(collection(db, "reports"), (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        // Listen to jobs for Admin rejections
        const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (jobsSnapshot) => {
           const jobsData = jobsSnapshot.docs.map(doc => doc.data() as Job);
           const rejectedCompanies = jobsData.filter(j => j.status === 'rejected' && j.companyName);
           
           const newBannedMap = new Map();

           // Add reported companies first (By Job Seeker)
           reportsData.forEach(rep => {
             if (!newBannedMap.has(rep.companyName)) {
               newBannedMap.set(rep.companyName, {
                 id: rep.companyName + '_rep',
                 name: rep.companyName,
                 bannedBy: 'Job Seeker',
                 purpose: rep.reason || 'Multiple fraud reports.',
                 date: rep.reportedAt ? new Date(rep.reportedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                 details: 'Suspended after receiving user reports.'
               });
             }
           });

           // Add Admin banned companies (overrides job seeker if both exist)
           rejectedCompanies.forEach(jb => {
             newBannedMap.set(jb.companyName, {
                id: jb.companyName + '_admin',
                name: jb.companyName,
                bannedBy: 'Admin',
                purpose: jb.hasWarning ? 'AI detected potential issues.' : 'Violated platform policies.',
                date: jb.createdAt ? new Date(jb.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
                details: 'Completely removed from the platform.'
             });
           });

           setBannedCompanies(Array.from(newBannedMap.values()).reverse());
        });
        
        return () => unsubscribeJobs();
    });

    return () => unsubscribeReports();
  }, []);
  
  const filteredJobs = jobs.filter(job => {
    // Exclude hidden jobs
    if (job.isHidden) return false;

    const matchKeyword = job.title.toLowerCase().includes(keyword.toLowerCase()) || 
                         job.description.toLowerCase().includes(keyword.toLowerCase());
    const matchLocation = job.location.toLowerCase().includes(location.toLowerCase());
    const matchExperience = experience === 'All Experience' || job.experience === experience;

    return matchKeyword && matchLocation && matchExperience;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Find Verified Jobs</h1>
           <p className="text-emerald-50 text-lg">Browse {filteredJobs.length} scam-free opportunities from trusted companies</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Banned Companies */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
             <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden sticky top-8">
                <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
                   <Ban className="text-red-600" size={20} />
                   <h2 className="font-bold text-red-800 text-lg">Banned Companies</h2>
                </div>
                <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto hide-scrollbar">
                   {bannedCompanies.length === 0 && (
                      <div className="text-center text-sm text-gray-500 py-4 opacity-70">
                         No banned companies currently.
                      </div>
                   )}
                   {bannedCompanies.map((company) => (
                     <div key={company.id} className="bg-white border text-sm border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-gray-900 truncate pr-2">{company.name}</h3>
                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${company.bannedBy === 'Job Seeker' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                             {company.bannedBy === 'Job Seeker' ? 'Reported' : 'Banned'}
                           </span>
                        </div>
                        <div className="space-y-2 text-xs text-gray-600">
                           <div className="flex items-start gap-1.5">
                              <ShieldCheck size={14} className="text-gray-400 shrink-0 mt-0.5" />
                              <p><span className="font-semibold text-gray-700">By:</span> {company.bannedBy}</p>
                           </div>
                           <div className="flex items-start gap-1.5">
                              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                              <p><span className="font-semibold text-gray-700">Reason:</span> {company.purpose}</p>
                           </div>
                           <div className="flex items-start gap-1.5">
                              <Calendar size={14} className="text-gray-400 shrink-0 mt-0.5" />
                              <p><span className="font-semibold text-gray-700">Date:</span> {company.date}</p>
                           </div>
                           <div className="flex items-start gap-1.5 border-t border-gray-50 pt-2 mt-2">
                              <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                              <p className="text-gray-500 italic">{company.details}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Right Column: Search List */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            {/* Search Bar Container */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Input 1: Keywords */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search jobs, companies..." 
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                  </div>

                  {/* Input 2: Location */}
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location (e.g. Delhi)" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                    />
                  </div>

                  {/* Input 3: Experience */}
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-3.5 text-emerald-600" size={20} />
                    <select 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white text-gray-700 border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer font-medium"
                    >
                       <option value="All Experience">All Experience</option>
                       <option value="Fresher">Fresher</option>
                       <option value="1-3 Years">1-3 Years</option>
                       <option value="3+ Years">3+ Years</option>
                       <option value="3-5 Years">3-5 Years</option>
                       <option value="5+ Years">5+ Years</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
               </div>
            </div>

            {/* Job List */}
            <div className="space-y-4">
               {filteredJobs.length > 0 ? (
                 filteredJobs.map((job) => (
                   <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                               <Building2 size={24} />
                            </div>
                            <div>
                               <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                               <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onCompanyClick) onCompanyClick(job.id);
                                    }}
                                    className="font-semibold text-gray-700 hover:text-blue-600 hover:underline mr-1 text-left"
                                  >
                                    {job.companyName}
                                  </button>
                                  <span className="text-gray-300">•</span>
                                  <MapPin size={14} className="ml-1" />
                                  <span className="capitalize">{job.location}</span>
                                  {job.vacancies && (
                                    <>
                                      <span className="text-gray-300 mx-1">•</span>
                                      <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                         <Users size={14} />
                                         <span>{job.vacancies} Openings</span>
                                      </div>
                                    </>
                                  )}
                               </div>
                            </div>
                         </div>
                         {job.isVerified && (
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold whitespace-nowrap">
                              <ShieldCheck size={14} />
                              Verified Safe
                           </div>
                         )}
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-6 mb-4 text-sm text-gray-600">
                         <div className="flex items-center gap-2">
                            <Briefcase size={16} className="text-gray-400" />
                            <span>{job.type}</span>
                         </div>
                         <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                            <IndianRupee size={16} strokeWidth={2.5} />
                            <span>{job.salary}</span>
                         </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-6 leading-relaxed max-w-3xl line-clamp-2">
                         {job.description}
                      </p>

                      <div className="flex flex-wrap gap-3 mb-6">
                         {job.isFree && (
                           <div className="flex items-center gap-2 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-lg border border-emerald-100 w-fit">
                              <CheckCircle2 size={16} className="shrink-0" />
                              100% Free - No Registration Fees
                           </div>
                         )}
                         {job.hasWarning && (
                           <div className="flex items-center gap-2 text-xs font-medium bg-amber-50 text-amber-700 px-3 py-2.5 rounded-lg border border-amber-100 w-fit">
                              <AlertTriangle size={16} className="shrink-0" />
                              AI detected potential issues - proceed with caution
                           </div>
                         )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                         <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={14} />
                            <span>Posted {job.postedDate}</span>
                         </div>
                         <button 
                            onClick={() => onApply && onApply(job.id, job.title)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm shadow-sm hover:shadow-md"
                         >
                            Apply Now
                         </button>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                       <Search className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindJobsSection;