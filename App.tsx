import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorksSection from './components/HowItWorksSection';
import SafetyGuaranteeSection from './components/SafetyGuaranteeSection';
import FindJobsSection from './components/FindJobsSection';
import LoginPage from './components/LoginPage';
import EmployerDashboard from './components/EmployerDashboard';
import MyApplications from './components/MyApplications';
import AdminDashboard from './components/AdminDashboard';
import JobApplicationForm, { ApplicationFormData } from './components/JobApplicationForm';
import CompanyProfilePage from './components/CompanyProfilePage'; // Imported
import UserProfile from './components/UserProfile';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { uploadResume } from './utils/cloudinaryUpload';
// --- Shared Types ---
export interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  isVerified: boolean;
  isFree: boolean;
  hasWarning: boolean;
  experience: string;
  companyName: string;
  employerId: string;
  createdAt?: string;
  isHidden?: boolean;
  vacancies?: string;
  companyWebsite?: string;
  companyCin?: string;
  companyDescription?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Application {
  id: string;
  jobId: string;
  employerId: string;
  applicantId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salary: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeName: string;
  appliedDate: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  experience: string;
  resumeUrl?: string; // New field for downloading/viewing
  createdAt?: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'jobs' | 'how-it-works' | 'login' | 'employer-dashboard' | 'my-applications' | 'apply-job' | 'admin-dashboard' | 'company-profile' | 'profile'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'job-seeker' | 'employer' | 'admin'>('job-seeker');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Shared Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Error State
  const [dbError, setDbError] = useState<string | null>(null);

  // --- 1. Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Special Super User Check: jeganvishnu22@gmail.com
        if (user.email === 'jeganvishnu22@gmail.com') {
          setIsLoggedIn(true);
          setCurrentUser(user);
          setUserRole('admin'); // Super user is granted Admin privileges which allows access to all pages
          return;
        }

        // Fetch User Role & Ban Status from Firestore for normal users
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.isBanned) {
              await signOut(auth);
              alert("Your account has been banned due to policy violations.");
              setIsLoggedIn(false);
              setCurrentUser(null);
              setUserRole('job-seeker');
              setCurrentView('login');
              return;
            }

            setIsLoggedIn(true);
            setCurrentUser(user);
            setUserRole(userData.role || 'job-seeker');
          } else {
            // Fallback if doc doesn't exist yet
            setIsLoggedIn(true);
            setCurrentUser(user);
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(true);
          setCurrentUser(user);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserRole('job-seeker');
      }
    });

    return () => unsubscribe();
  }, []);

  // --- 2. Realtime Jobs Listener ---
  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("postedDate", "desc"));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        setJobs(jobsData);
        setDbError(null);
      },
      (error) => {
        console.error("Firestore Error:", error);
        if (error.code === 'permission-denied') {
          setDbError("Missing Permissions: Please update Firestore Rules.");
        } else {
          setDbError("Connection Error: " + error.message);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // --- 3. Realtime Reports Listener ---
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "reports"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
    });
    return () => unsubscribe();
  }, []);

  // --- STRICT VIEW NAVIGATION GUARD ---
  const navigateToView = (view: typeof currentView) => {
    // 1. Admin (Super User) Access: Can go anywhere
    if (userRole === 'admin') {
      setCurrentView(view);
      return;
    }

    // 2. Guest Access (Not Logged In)
    if (!isLoggedIn) {
      const protectedViews = ['employer-dashboard', 'my-applications', 'admin-dashboard', 'profile'];
      if (protectedViews.includes(view)) {
        setCurrentView('login');
        return;
      }
      setCurrentView(view);
      return;
    }

    // 3. Employer Strict Access
    if (userRole === 'employer') {
      // Employers strictly blocked from Job Seeker pages ('my-applications') and Admin
      if (view === 'my-applications') {
        alert("Access Denied: Please login as a Job Seeker to view applications.");
        return;
      }
      if (view === 'admin-dashboard') {
        alert("Access Denied: Admin privileges required.");
        return;
      }
    }

    // 4. Job Seeker Strict Access
    if (userRole === 'job-seeker') {
      // Job Seekers strictly blocked from Employer Dashboard and Admin
      if (view === 'employer-dashboard') {
        alert("Access Denied: Please login as an Employer to access the dashboard.");
        return;
      }
      if (view === 'admin-dashboard') {
        alert("Access Denied: Admin privileges required.");
        return;
      }
    }

    setCurrentView(view);
  };

  const handleLoginSuccess = (role: 'job-seeker' | 'employer' | 'admin') => {
    // If specific email, override role and redirect to Admin Dashboard
    if (auth.currentUser?.email === 'jeganvishnu22@gmail.com') {
      setCurrentView('admin-dashboard');
      return;
    }

    if (role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (role === 'employer') {
      setCurrentView('employer-dashboard');
    } else if (role === 'job-seeker') {
      setCurrentView('jobs');
    } else {
      setCurrentView('home');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('home');
    setSelectedJob(null);
  };

  const handleApplyClick = (jobId: string) => {
    if (!isLoggedIn) {
      alert("Please login to apply for jobs.");
      setCurrentView('login');
      return;
    }
    // Strict block for employers attempting to apply
    if (userRole === 'employer') {
      alert("Employers cannot apply for jobs. Please register as a Job Seeker.");
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setCurrentView('apply-job');
    }
  };

  const handleCompanyClick = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setCurrentView('company-profile');
    }
  };

  const handleApplicationSubmit = async (formData: ApplicationFormData) => {
    if (!selectedJob || !currentUser) return;

    try {
      let uploadedResumeUrl = '';
      if (formData.resume) {
        // Upload resume utilizing Cloudinary
        uploadedResumeUrl = await uploadResume(formData.resume);
      }

      const newApplication = {
        jobId: selectedJob.id,
        employerId: selectedJob.employerId,
        applicantId: currentUser.uid,
        jobTitle: selectedJob.title,
        companyName: selectedJob.companyName,
        location: selectedJob.location,
        salary: selectedJob.salary,
        applicantName: formData.fullName,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        resumeName: formData.resume ? formData.resume.name : 'resume.pdf',
        resumeUrl: uploadedResumeUrl,
        appliedDate: new Date().toLocaleDateString(),
        status: 'Pending' as const,
        experience: 'Fresher',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "applications"), newApplication);

      alert("Application submitted successfully! Redirecting to My Applications.");
      navigateToView('my-applications');
      setSelectedJob(null);
    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert(`Failed to submit: ${error.message}`);
    }
  };

  // Filter jobs to only show approved ones to job seekers
  const companyReportCounts = reports.reduce((acc, report) => {
    acc[report.companyName] = (acc[report.companyName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const approvedJobs = jobs.filter(job => job.status === 'approved' && (companyReportCounts[job.companyName] || 0) < 3);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden flex flex-col">
      {/* DB Error Banner */}
      {dbError && (
        <div className="bg-red-600 text-white px-4 py-3 text-center z-[100] relative shadow-md">
          <p className="font-bold flex items-center justify-center gap-2">
            <span className="text-xl">⚠️</span> Database Connection Error
          </p>
          <p className="text-sm mt-1 opacity-90">{dbError}</p>
        </div>
      )}

      {currentView !== 'login' && currentView !== 'apply-job' && (
        <Header
          onNavigate={navigateToView}
          isLoggedIn={isLoggedIn}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            <HeroSection
              onFindJobs={() => navigateToView('jobs')}
              onEmployerDashboard={() => navigateToView('employer-dashboard')}
              isLoggedIn={isLoggedIn}
              userRole={userRole}
            />
            <HowItWorksSection isPreview={true} />
            <SafetyGuaranteeSection />
          </>
        )}

        {currentView === 'jobs' && (
          <FindJobsSection
            jobs={approvedJobs}
            onApply={handleApplyClick}
            onCompanyClick={handleCompanyClick}
          />
        )}

        {currentView === 'apply-job' && selectedJob && (
          <JobApplicationForm
            job={selectedJob}
            onCancel={() => navigateToView('jobs')}
            onSubmit={handleApplicationSubmit}
          />
        )}

        {currentView === 'company-profile' && selectedJob && (
          <CompanyProfilePage
            job={selectedJob}
            onBack={() => navigateToView('jobs')}
          />
        )}

        {currentView === 'how-it-works' && (
          <>
            <HowItWorksSection isPreview={false} />
            <SafetyGuaranteeSection />
          </>
        )}

        {currentView === 'employer-dashboard' && (
          <EmployerDashboard
            currentUser={currentUser}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            currentUser={currentUser}
          />
        )}

        {currentView === 'my-applications' && (
          <MyApplications
            onBrowseJobs={() => navigateToView('jobs')}
            currentUser={currentUser}
          />
        )}

        {currentView === 'profile' && (
          <UserProfile
            currentUser={currentUser}
            userRole={userRole}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onNavigate={navigateToView}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </main>

      {currentView !== 'login' && currentView !== 'apply-job' && currentView !== 'employer-dashboard' && currentView !== 'my-applications' && currentView !== 'admin-dashboard' && currentView !== 'company-profile' && currentView !== 'profile' && (
        <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
            <p>&copy; {new Date().getFullYear()} SafeHire India. All rights reserved.</p>
            <p>
              For any queries, please contact us at:{' '}
              <a href="mailto:jegan43017@gmail.com" className="text-blue-600 hover:underline">
                jegan43017@gmail.com
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;