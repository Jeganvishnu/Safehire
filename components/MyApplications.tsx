import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Calendar, CheckCircle2, Clock, XCircle, FileText, IndianRupee } from 'lucide-react';
import type { Application } from '../App';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface MyApplicationsProps {
  onBrowseJobs: () => void;
  currentUser: any;
}

const MyApplications: React.FC<MyApplicationsProps> = ({ onBrowseJobs, currentUser }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query applications where applicantId == currentUser.uid
    const q = query(collection(db, "applications"), where("applicantId", "==", currentUser.uid));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const apps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];
        setApplications(apps);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("MyApplications DB Error:", err);
        setError("Unable to load applications. Check database permissions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Shortlisted': return <CheckCircle2 size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      case 'Reviewed': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="flex flex-col items-center justify-center gap-3 mb-2">
             <Briefcase size={40} className="text-white opacity-90" />
             <h1 className="text-3xl md:text-4xl font-bold">My Applications</h1>
           </div>
           <p className="text-emerald-100 text-lg">Track your job applications</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center mb-6">
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        {!error && applications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 md:p-20 mb-20 text-center animate-fade-in">
             <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Briefcase className="text-gray-400" size={48} strokeWidth={1.5} />
             </div>
             <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No Applications Yet</h3>
             <p className="text-gray-50 max-w-md mx-auto mb-8 text-base leading-relaxed">
               You haven't applied to any jobs yet. Start exploring verified opportunities!
             </p>
             <button
                onClick={onBrowseJobs}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
             >
                Browse Jobs
             </button>
          </div>
        ) : !error && (
          /* Applications List */
          <div className="space-y-6 mb-20">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                 <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    
                    {/* Job Details */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between md:justify-start gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{app.jobTitle}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)} md:hidden`}>
                           {getStatusIcon(app.status)}
                           {app.status}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600 mb-4">
                         <div className="flex items-center gap-1.5">
                            <Building2 size={16} className="text-gray-400" />
                            <span className="font-semibold text-gray-700">{app.companyName}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{app.location}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <IndianRupee size={16} className="text-gray-400" />
                            <span>{app.salary}</span>
                         </div>
                      </div>

                      {/* Resume Info */}
                      <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600">
                         <FileText size={14} className="text-emerald-600" />
                         <span>Resume sent: {app.resumeName}</span>
                      </div>
                    </div>

                    {/* Status & Date (Desktop) */}
                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                       <div className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                           {getStatusIcon(app.status)}
                           {app.status}
                       </div>
                       <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={14} />
                          Applied on {app.appliedDate}
                       </div>
                    </div>

                 </div>
              </div>
            ))}

            <div className="text-center pt-8">
               <button
                  onClick={onBrowseJobs}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-8 rounded-lg transition-colors"
               >
                  Find More Jobs
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyApplications;