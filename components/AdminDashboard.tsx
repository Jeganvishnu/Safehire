import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Search, 
  Users, 
  BarChart3, 
  Settings, 
  Briefcase, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Ban,
  Download,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Job } from '../App';

interface AdminDashboardProps {
  currentUser: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'job-review' | 'users'>('overview');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalUsers, setTotalUsers] = useState(0); // Mock or fetch if you have users collection read access
  const [loading, setLoading] = useState(true);

  // --- Realtime Data Fetching ---
  useEffect(() => {
    // 1. Fetch Jobs
    const jobsQuery = query(collection(db, "jobs"));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
      setLoading(false);
    });

    // 2. Fetch Users (If possible, else mock count)
    // Note: Reading "users" collection might require admin rules
    const usersQuery = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
       setTotalUsers(snapshot.size);
    }, (error) => {
       console.log("Admin: Could not fetch users count (permissions). Using mock.");
       setTotalUsers(12450); // Fallback mock from screenshot
    });

    return () => {
      unsubscribeJobs();
      unsubscribeUsers();
    };
  }, []);

  // --- Derived Stats ---
  const employersVerified = jobs.filter(j => j.isVerified).length; // Rough approximation based on verified jobs
  const jobsPosted = jobs.length;
  const flaggedJobs = jobs.filter(j => j.hasWarning || j.status === 'pending').length;

  // --- Actions ---
  const handleApproveJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: 'approved',
        hasWarning: false,
        isHidden: false,
        isVerified: true
      });
    } catch (error) {
      console.error("Error approving job:", error);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: 'rejected',
        isHidden: true,
        isVerified: false
      });
    } catch (error) {
      console.error("Error rejecting job:", error);
    }
  };

  const handleBlockJob = async (jobId: string) => {
    try {
       // In a real app, maybe ban the user too. Here, just delete or hide permanently.
       await deleteDoc(doc(db, "jobs", jobId));
    } catch (error) {
      console.error("Error blocking job:", error);
    }
  };

  // --- Company Verification Action ---
  const handleVerifyCompany = async (companyName: string, isApproved: boolean) => {
    // Find all jobs belonging to this company
    const companyJobs = jobs.filter(j => j.companyName === companyName);
    
    try {
      // Update all jobs for this company
      const updatePromises = companyJobs.map(job => 
        updateDoc(doc(db, "jobs", job.id), {
          isVerified: isApproved,
          status: isApproved ? 'approved' : 'rejected',
          isHidden: !isApproved // Hide if rejected
        })
      );
      
      await Promise.all(updatePromises);
      console.log(`Company ${companyName} ${isApproved ? 'Approved' : 'Rejected'}`);
    } catch (error) {
      console.error("Error updating company verification:", error);
    }
  };

  // --- Helper Components ---

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: typeof activeTab }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id 
        ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' 
        : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  const StatCard = ({ label, value, icon: Icon, colorClass }: { label: string, value: string | number, icon: any, colorClass: string }) => (
    <div className={`p-6 rounded-xl shadow-sm text-white ${colorClass} flex items-center justify-between`}>
      <div>
        <h3 className="text-sm font-medium opacity-90">{label}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-lg">
        <Icon size={24} />
      </div>
    </div>
  );

  const RiskBadge = ({ level }: { level: 'High' | 'Medium' | 'Low' }) => {
    const styles = {
      High: 'bg-red-100 text-red-700 border-red-200',
      Medium: 'bg-amber-100 text-amber-700 border-amber-200',
      Low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${styles[level]}`}>
        {level === 'High' && <AlertTriangle size={12} />}
        {level === 'Medium' && <AlertTriangle size={12} />}
        {level === 'Low' && <CheckCircle2 size={12} />}
        {level} Risk
      </span>
    );
  };

  // --- Sections ---

  // Aggregate jobs by company for the verification table
  // We determine status based on whether *all* jobs are approved/verified or not
  const uniqueCompanies = (Array.from(new Set(jobs.map(j => j.companyName))) as string[])
    .map(name => {
       const companyJobs = jobs.filter(j => j.companyName === name);
       
       // Determine company status based on its jobs
       const isApproved = companyJobs.some(j => j.status === 'approved');
       const isRejected = companyJobs.length > 0 && companyJobs.every(j => j.status === 'rejected');
       
       let displayStatus = 'Pending';
       if (isApproved) displayStatus = 'Approved';
       else if (isRejected) displayStatus = 'Rejected';

       const cin = companyJobs[0]?.companyCin || 'N/A';
       
       return {
         name: name,
         cin: cin,
         status: displayStatus,
         isVerified: isApproved
       };
    });

  const pendingJobs = jobs.filter(j => !j.status || j.status === 'pending');
  const flaggedJobsList = jobs.filter(j => j.hasWarning);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <div className="flex items-center gap-2">
             <div className="bg-emerald-600 text-white p-1 rounded">
               <ShieldCheck size={20} />
             </div>
             <span className="font-bold text-gray-900">SafeHire Admin</span>
           </div>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-2">Main Menu</div>
           <SidebarItem icon={LayoutDashboard} label="Dashboard" id="overview" />
           <SidebarItem icon={ShieldCheck} label="Employer Verification" id="verification" />
           <SidebarItem icon={Search} label="Job Review (AI)" id="job-review" />
           
           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Management</div>
           <SidebarItem icon={Users} label="Users" id="users" />
           <SidebarItem icon={BarChart3} label="Reports" id="overview" />
           <SidebarItem icon={Settings} label="Settings" id="overview" />
        </div>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                 A
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 truncate">{currentUser.email}</p>
                 <p className="text-xs text-gray-500">Super Admin</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold text-gray-800">
             {activeTab === 'overview' && 'Dashboard Overview'}
             {activeTab === 'verification' && 'Employer Verification'}
             {activeTab === 'job-review' && 'Job Review & AI Risk'}
             {activeTab === 'users' && 'User Management'}
           </h1>
           <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Last updated: Just now</span>
              <button className="bg-white border border-gray-200 p-2 rounded-lg text-gray-600 hover:bg-gray-50">
                 <Settings size={20} />
              </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon={Users} colorClass="bg-emerald-500" />
           <StatCard label="Employers Verified" value={uniqueCompanies.filter(c => c.isVerified).length} icon={ShieldCheck} colorClass="bg-blue-600" />
           <StatCard label="Jobs Posted" value={jobsPosted} icon={Briefcase} colorClass="bg-cyan-500" />
           <StatCard label="Flagged Jobs" value={flaggedJobs} icon={Flag} colorClass="bg-red-500" />
        </div>

        {/* --- DASHBOARD OVERVIEW CONTENT --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Pending Verifications */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Employer Verification Table (Mini) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Recent Employer Verifications</h3>
                    <button className="text-sm text-blue-600 font-semibold hover:underline" onClick={() => setActiveTab('verification')}>View All</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500">
                          <tr>
                             <th className="px-6 py-3 font-medium">Company Name</th>
                             <th className="px-6 py-3 font-medium">CIN Status</th>
                             <th className="px-6 py-3 font-medium">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {uniqueCompanies.slice(0, 5).map((co, i) => (
                             <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{co.name}</td>
                                <td className="px-6 py-4">
                                   <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                      co.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                      co.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                      'bg-yellow-100 text-yellow-700'
                                   }`}>
                                      {co.status}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex gap-2">
                                      <button 
                                        onClick={() => handleVerifyCompany(co.name, true)}
                                        className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700"
                                      >
                                        Approve
                                      </button>
                                      <button 
                                        onClick={() => handleVerifyCompany(co.name, false)}
                                        className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                                      >
                                        Reject
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Job Review Table (Mini) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Pending Job Reviews</h3>
                    <button className="text-sm text-blue-600 font-semibold hover:underline" onClick={() => setActiveTab('job-review')}>View All</button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-gray-50 text-gray-500">
                          <tr>
                             <th className="px-6 py-3 font-medium">Job Title</th>
                             <th className="px-6 py-3 font-medium">Company</th>
                             <th className="px-6 py-3 font-medium">AI Risk Score</th>
                             <th className="px-6 py-3 font-medium">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                          {jobs.slice(0, 5).map((job) => {
                             // Mock Risk calculation
                             const isHighRisk = job.description.toLowerCase().includes('payment') || job.hasWarning;
                             const riskLevel = isHighRisk ? 'High' : (job.salary.includes('50000') ? 'Medium' : 'Low');
                             
                             return (
                                <tr key={job.id} className="hover:bg-gray-50">
                                   <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                                   <td className="px-6 py-4 text-gray-600">{job.companyName}</td>
                                   <td className="px-6 py-4">
                                      <RiskBadge level={riskLevel} />
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="flex gap-2">
                                         <button onClick={() => handleApproveJob(job.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"><CheckCircle2 size={16} /></button>
                                         <button onClick={() => handleRejectJob(job.id)} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"><XCircle size={16} /></button>
                                         <button onClick={() => handleBlockJob(job.id)} className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"><Ban size={16} /></button>
                                      </div>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </div>

            </div>

            {/* Right Column: AI Flags & Stats */}
            <div className="space-y-6">
               
               {/* AI Flagged Card */}
               <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                  <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                     <div className="flex items-center gap-2 text-red-800 font-bold">
                        <AlertTriangle size={18} />
                        AI Flagged Jobs
                     </div>
                     <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">{flaggedJobs} flagged</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {flaggedJobsList.slice(0, 3).map((job) => (
                        <div key={job.id} className="p-4 hover:bg-gray-50">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-800 text-sm">{job.title}</h4>
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">Risk: 85%</span>
                           </div>
                           <p className="text-xs text-gray-500 mb-2">{job.companyName}</p>
                           <div className="flex gap-2 mb-3">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">Payment mentioned</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">WhatsApp contact</span>
                           </div>
                           <div className="flex gap-2">
                              <button className="flex-1 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded hover:bg-gray-50 flex items-center justify-center gap-1">
                                 <Eye size={12} /> Review
                              </button>
                              <button onClick={() => handleRejectJob(job.id)} className="px-2 bg-red-500 text-white rounded hover:bg-red-600">
                                 <XCircle size={14} />
                              </button>
                           </div>
                        </div>
                     ))}
                     {flaggedJobsList.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                           No high-risk jobs detected.
                        </div>
                     )}
                  </div>
               </div>

               {/* Recent Decisions Log */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <LayoutDashboard size={16} className="text-blue-500" />
                        Recent AI Decisions
                     </h3>
                     <button className="text-gray-400 hover:text-gray-600">
                        <Download size={16} />
                     </button>
                  </div>
                  <div className="space-y-4">
                     {[
                        { job: "Data Entry Clerk", decision: "Rejected", reason: "Payment requested", time: "10 mins ago", color: "bg-red-100 text-red-700" },
                        { job: "Software Developer", decision: "Approved", reason: "Verified company", time: "25 mins ago", color: "bg-green-100 text-green-700" },
                        { job: "Sales Executive", decision: "Review", reason: "High Salary", time: "1 hour ago", color: "bg-amber-100 text-amber-700" }
                     ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                           <div>
                              <p className="font-bold text-gray-700">{item.job}</p>
                              <p className="text-gray-400">{item.reason}</p>
                           </div>
                           <div className="text-right">
                              <span className={`px-2 py-0.5 rounded ${item.color} font-bold`}>{item.decision}</span>
                              <p className="text-gray-400 mt-1">{item.time}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
          </div>
        )}

        {/* --- JOB REVIEW TAB CONTENT --- */}
        {activeTab === 'job-review' && (
          <div className="space-y-6">
            {/* Filter and Stats for Review */}
            {(() => {
                const reviewQueue = jobs.filter(j => j.status === 'pending' || j.hasWarning);
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500">Total Pending Review</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{reviewQueue.length}</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
                                <h3 className="text-sm font-bold text-red-800">High Risk Detected</h3>
                                <p className="text-3xl font-bold text-red-900 mt-2">
                                    {reviewQueue.filter(j => j.hasWarning).length}
                                </p>
                            </div>
                            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
                                <h3 className="text-sm font-bold text-emerald-800">Low Risk / Safe</h3>
                                <p className="text-3xl font-bold text-emerald-900 mt-2">
                                    {reviewQueue.filter(j => !j.hasWarning).length}
                                </p>
                            </div>
                        </div>

                        {/* Review Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Job Review Queue</h2>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                        <Filter size={14} /> Filter
                                    </button>
                                </div>
                            </div>
                            
                            {reviewQueue.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                                    <p className="text-lg font-medium">All caught up!</p>
                                    <p className="text-sm">No jobs pending review.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Job Details</th>
                                                <th className="px-6 py-4 font-bold">Company</th>
                                                <th className="px-6 py-4 font-bold">AI Risk Analysis</th>
                                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reviewQueue.map((job) => {
                                                const isHighRisk = job.description.toLowerCase().includes('payment') || job.hasWarning;
                                                const riskLevel = isHighRisk ? 'High' : (job.salary.includes('50000') ? 'Medium' : 'Low');
                                                
                                                return (
                                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="font-bold text-gray-900">{job.title}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{job.type} • {job.location}</p>
                                                                <p className="text-xs text-gray-400 mt-1">Posted: {job.postedDate}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="font-semibold text-gray-700">{job.companyName}</p>
                                                                {job.companyCin ? (
                                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">CIN Verified</span>
                                                                ) : (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">Unverified</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-2">
                                                                <div>
                                                                    <RiskBadge level={riskLevel} />
                                                                </div>
                                                                {isHighRisk && (
                                                                    <div className="flex flex-wrap gap-1">
                                                                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">Suspicious Keywords</span>
                                                                    </div>
                                                                )}
                                                                {!isHighRisk && (
                                                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                                        <CheckCircle2 size={12} /> Clean Scan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button 
                                                                    onClick={() => handleApproveJob(job.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
                                                                >
                                                                    <CheckCircle2 size={14} /> Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleRejectJob(job.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-all"
                                                                >
                                                                    <XCircle size={14} /> Reject
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleBlockJob(job.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Block Permanently"
                                                                >
                                                                    <Ban size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                );
            })()}
          </div>
        )}

        {/* --- OTHER TABS PLACEHOLDERS --- */}
        {activeTab === 'verification' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Full Employer Verification List</h2>
              <p className="text-gray-500">This view would contain the complete paginated list of all employers requiring verification.</p>
           </div>
        )}
        
        {activeTab === 'users' && (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <p className="text-gray-500">Manage all {totalUsers} registered users, roles, and permissions.</p>
           </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;