import React, { useState, useEffect } from 'react';
import { Building2, FileText, Briefcase, AlertCircle, Loader2, CheckCircle2, XCircle, Search, MapPin, IndianRupee, Clock, ShieldCheck, AlertTriangle, User, Mail, Calendar, Phone, X, Download, ExternalLink, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import type { Job, Application } from '../App';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface EmployerDashboardProps {
    currentUser: any; // Passed from App.tsx
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'registration' | 'post-job' | 'my-jobs' | 'applications'>('registration');
    const [isRegistered, setIsRegistered] = useState(false);

    // Local state to manage application status updates
    const [localApplications, setLocalApplications] = useState<Application[]>([]);
    const [myJobs, setMyJobs] = useState<Job[]>([]); // New State for My Jobs
    const [dbError, setDbError] = useState<string | null>(null);

    // State for Resume Viewer Modal
    const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

    // State for Deletion Loading
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [jobToDelete, setJobToDelete] = useState<string | null>(null); // State for confirmation modal

    // State for Toggling Visibility Loading
    const [togglingJobId, setTogglingJobId] = useState<string | null>(null);

    // Fetch Applications Realtime
    useEffect(() => {
        if (!currentUser) return;

        // Listen for applications where employerId == currentUser.uid
        const q = query(collection(db, "applications"), where("employerId", "==", currentUser.uid));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const apps = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Application[];
                // Sort by newest first locally since we didn't index appliedDate yet
                apps.sort((a, b) => new Date(b.createdAt || b.appliedDate).getTime() - new Date(a.createdAt || a.appliedDate).getTime());
                setLocalApplications(apps);
                setDbError(null);
            },
            (error) => {
                console.error("Employer DB Error:", error);
                setDbError("Error loading applications. Check permissions.");
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch My Posted Jobs Realtime
    useEffect(() => {
        if (!currentUser) return;

        const q = query(collection(db, "jobs"), where("employerId", "==", currentUser.uid));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const jobs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Job[];
                // Sort newest first
                jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
                setMyJobs(jobs);
            },
            (error) => {
                console.error("Error fetching my jobs:", error);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    // Registration Form State
    const [formData, setFormData] = useState({
        companyName: '',
        cinNumber: '',
        gstNumber: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        description: '' // Added company description
    });

    // Job Post Form State
    const [jobData, setJobData] = useState({
        jobTitle: '',
        jobDescription: '',
        minSalary: '',
        maxSalary: '',
        location: '',
        experienceLevel: 'Fresher',
        jobType: 'Full Time',
        vacancies: '',
        disclaimerChecked: false
    });

    const [isPosting, setIsPosting] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'cinNumber' || name === 'gstNumber') {
            setFormData({ ...formData, [name]: value.toUpperCase() });
            if (name === 'cinNumber') setVerificationStatus('idle');
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setJobData({ ...jobData, [name]: value });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJobData({ ...jobData, disclaimerChecked: e.target.checked });
    };

    const verifyCin = async () => {
        if (!formData.cinNumber) return;
        if (formData.cinNumber.length !== 21) {
            alert("CIN Number must be exactly 21 characters long.");
            return;
        }
        setVerificationStatus('loading');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const isValidFormat = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(formData.cinNumber);
            if (isValidFormat) {
                setVerificationStatus('valid');
            } else {
                setVerificationStatus('invalid');
            }
        } catch (error) {
            console.error("Verification failed:", error);
            setVerificationStatus('error');
        }
    };

    const handleSubmitRegistration = (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationStatus !== 'valid') {
            alert("Please verify your CIN number before submitting.");
            return;
        }
        setIsRegistered(true);
        alert('Company Verified Successfully! You can now post jobs.');
        setActiveTab('post-job');
    };

    const handlePostJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobData.disclaimerChecked) {
            alert("You must confirm the safety disclaimer.");
            return;
        }
        if (!currentUser) return;

        setIsPosting(true);

        try {
            // Format Salary
            const minK = parseInt(jobData.minSalary) >= 1000 ? `${parseInt(jobData.minSalary) / 1000}k` : jobData.minSalary;
            const maxK = parseInt(jobData.maxSalary) >= 1000 ? `${parseInt(jobData.maxSalary) / 1000}k` : jobData.maxSalary;

            // Create new Job object for Firestore
            const newJob = {
                employerId: currentUser.uid,
                title: jobData.jobTitle,
                companyName: formData.companyName || "Your Company Name",
                location: jobData.location,
                type: `${jobData.experienceLevel} • ${jobData.jobType}`,
                salary: `₹${minK} - ₹${maxK}/month`,
                description: jobData.jobDescription,
                postedDate: new Date().toLocaleDateString(),
                isVerified: true,
                isFree: true,
                hasWarning: false, // AI Check Passed
                experience: jobData.experienceLevel,
                createdAt: new Date().toISOString(),
                isHidden: false,
                vacancies: jobData.vacancies || '1',
                // Save company details with the job
                companyWebsite: formData.website,
                companyCin: formData.cinNumber,
                companyDescription: formData.description || formData.address || "Verified Company"
            };

            await addDoc(collection(db, "jobs"), newJob);

            setIsPosting(false);
            alert("Job Posted Successfully! It is now visible to students in 'Find Jobs'.");

            setJobData({
                jobTitle: '',
                jobDescription: '',
                minSalary: '',
                maxSalary: '',
                location: '',
                experienceLevel: 'Fresher',
                jobType: 'Full Time',
                vacancies: '',
                disclaimerChecked: false
            });

            // Switch to My Jobs tab to show the new job
            setActiveTab('my-jobs');

        } catch (error) {
            console.error("Error posting job:", error);
            alert("Failed to post job. Check database permissions.");
            setIsPosting(false);
        }
    };

    const handleDeleteJob = (e: React.MouseEvent, jobId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setJobToDelete(jobId);
    };

    const confirmDeleteJob = async () => {
        if (!jobToDelete) return;

        setDeletingJobId(jobToDelete);
        try {
            console.log(`Attempting to delete job: ${jobToDelete}`);
            await deleteDoc(doc(db, "jobs", jobToDelete));
            console.log(`Job ${jobToDelete} deleted successfully.`);
            setJobToDelete(null); // Close modal
        } catch (error: any) {
            console.error("Error deleting job:", error);

            // Check for common permission error
            if (error.code === 'permission-denied') {
                alert("Permission Denied: You do not have permission to delete this job. Please check your Firestore Security Rules to allow delete.");
            } else {
                alert(`Failed to delete job: ${error.message}`);
            }
        } finally {
            setDeletingJobId(null);
        }
    };

    const handleToggleVisibility = async (e: React.MouseEvent, job: Job) => {
        e.preventDefault();
        e.stopPropagation();

        setTogglingJobId(job.id);
        try {
            const jobRef = doc(db, "jobs", job.id);
            await updateDoc(jobRef, {
                isHidden: !job.isHidden
            });
        } catch (error: any) {
            console.error("Error updating job visibility:", error);
            if (error.code === 'permission-denied') {
                alert("Permission Denied: Unable to update job. Check Firestore rules.");
            } else {
                alert("Failed to update job visibility.");
            }
        } finally {
            setTogglingJobId(null);
        }
    };

    // --- Handlers for Applications ---

    const handleShortlist = async (appId: string) => {
        try {
            const appRef = doc(db, "applications", appId);
            await updateDoc(appRef, {
                status: "Shortlisted"
            });
            // UI updates automatically via onSnapshot
        } catch (error) {
            console.error("Error shortlisting:", error);
            alert("Failed to update status. Check permissions.");
        }
    };

    const handleReject = async (appId: string) => {
        try {
            const appRef = doc(db, "applications", appId);
            await updateDoc(appRef, {
                status: "Rejected"
            });
        } catch (error) {
            console.error("Error rejecting:", error);
            alert("Failed to update status. Check permissions.");
        }
    };

    const handleViewResume = async (app: Application) => {
        setViewingApplication(app);
        if (app.status === 'Pending') {
            try {
                const appRef = doc(db, "applications", app.id);
                await updateDoc(appRef, { status: "Reviewed" });
            } catch (e) { console.error(e); }
        }
    };

    const closeResumeViewer = () => {
        setViewingApplication(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 mb-2">
                        <Building2 size={40} className="text-white opacity-90" />
                        <h1 className="text-3xl md:text-4xl font-bold">Employer Dashboard</h1>
                    </div>
                    <p className="text-blue-100 text-lg">Manage your company and job postings</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 flex flex-wrap">
                    <button
                        onClick={() => setActiveTab('registration')}
                        className={`flex-1 py-4 px-6 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 whitespace-nowrap ${activeTab === 'registration'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Company Registration
                        {isRegistered && <CheckCircle2 size={14} className="inline ml-2 text-green-500" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('post-job')}
                        className={`flex-1 py-4 px-6 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 whitespace-nowrap ${activeTab === 'post-job'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Post Jobs
                    </button>

                    {/* New My Jobs Tab */}
                    <button
                        onClick={() => setActiveTab('my-jobs')}
                        className={`flex-1 py-4 px-6 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 whitespace-nowrap ${activeTab === 'my-jobs'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Posted Jobs
                        {myJobs.length > 0 && (
                            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-bold">
                                {myJobs.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 py-4 px-6 text-sm font-medium text-center focus:outline-none transition-colors border-b-2 whitespace-nowrap ${activeTab === 'applications'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Applications
                        {localApplications.length > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs font-bold">
                                {localApplications.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-b-xl shadow-lg border border-gray-100 p-6 md:p-10 mb-20">

                    {/* ===================== REGISTRATION TAB ===================== */}
                    {activeTab === 'registration' && (
                        <div className="animate-fade-in">
                            {isRegistered ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="text-green-600" size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Verified & Registered</h2>
                                    <p className="text-gray-500 mb-6">You can now post unlimited verified jobs.</p>
                                    <button
                                        onClick={() => setActiveTab('post-job')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                                    >
                                        Post a New Job
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8 border-b border-gray-100 pb-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">Register Your Company</h2>
                                        <p className="text-gray-500 text-sm">To post jobs, you must verify your company with valid CIN and GST numbers.</p>
                                    </div>

                                    <form onSubmit={handleSubmitRegistration} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* CIN Number */}
                                            <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                                                <label className="block text-xs font-bold text-gray-700">CIN Number *</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="cinNumber"
                                                        value={formData.cinNumber}
                                                        onChange={handleChange}
                                                        placeholder="U74999DL2020PTC123456"
                                                        maxLength={21}
                                                        className={`w-full p-3 pr-24 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all uppercase bg-white font-mono tracking-wide ${verificationStatus === 'valid'
                                                                ? 'border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50/10'
                                                                : verificationStatus === 'invalid'
                                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/10'
                                                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={verifyCin}
                                                        disabled={verificationStatus === 'loading' || !formData.cinNumber}
                                                        className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {verificationStatus === 'loading' ? (
                                                            <>
                                                                <Loader2 size={14} className="animate-spin" />
                                                                Checking...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Verify
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="min-h-[20px]">
                                                    {verificationStatus === 'valid' && (
                                                        <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1">
                                                            <CheckCircle2 size={12} />
                                                            Company Verified Successfully
                                                        </p>
                                                    )}
                                                    {verificationStatus === 'invalid' && (
                                                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                                            <XCircle size={12} />
                                                            Invalid CIN Format or Not Found
                                                        </p>
                                                    )}
                                                    {verificationStatus === 'error' && (
                                                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1">
                                                            <AlertCircle size={12} />
                                                            Connection Error. Please check Resource ID.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Company Name */}
                                            <div className="space-y-1.5 lg:col-span-1">
                                                <label className="block text-xs font-bold text-gray-700">Company Name *</label>
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    placeholder="Acme Technologies Pvt Ltd"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>

                                            {/* Other fields */}
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">GST Number (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="gstNumber"
                                                    value={formData.gstNumber}
                                                    onChange={handleChange}
                                                    placeholder="22AAAAA0000A1Z5"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase bg-white"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Official Company Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="contact@company.com"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="+91 98765 43210"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Company Website *</label>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleChange}
                                                    placeholder="https://www.company.com"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">About Company *</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="Brief description of your company, mission, and culture."
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y bg-white"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Office Address *</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={2}
                                                placeholder="Full office address with city, state, and PIN code"
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y bg-white"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                disabled={verificationStatus !== 'valid'}
                                            >
                                                {verificationStatus === 'valid' ? (
                                                    <>
                                                        <CheckCircle2 size={18} /> Submit for Verification
                                                    </>
                                                ) : (
                                                    "Verify CIN to Submit"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* ===================== POST JOB TAB ===================== */}
                    {activeTab === 'post-job' && (
                        <div className="animate-fade-in">
                            {!isRegistered ? (
                                <div className="text-center py-20">
                                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Complete Registration First</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                                        You need to verify your company details in the 'Company Registration' tab before you can post jobs.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('registration')}
                                        className="mt-6 text-blue-600 font-semibold hover:underline"
                                    >
                                        Go to Registration
                                    </button>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-8">
                                        <h2 className="text-xl font-bold text-gray-900">Post a New Job</h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Your job post will be analyzed by AI for compliance before going live.
                                        </p>
                                    </div>

                                    <form onSubmit={handlePostJob} className="space-y-6">
                                        {/* Job Title */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Job Title *</label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={jobData.jobTitle}
                                                onChange={handleJobChange}
                                                placeholder="e.g. Senior Software Engineer"
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                required
                                            />
                                        </div>

                                        {/* Job Description */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-700">Job Description *</label>
                                            <textarea
                                                name="jobDescription"
                                                value={jobData.jobDescription}
                                                onChange={handleJobChange}
                                                rows={5}
                                                placeholder="Describe the role, responsibilities, and requirements..."
                                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y bg-white"
                                                required
                                            />
                                        </div>

                                        {/* Salary Range */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Min Salary (₹) *</label>
                                                <input
                                                    type="number"
                                                    name="minSalary"
                                                    value={jobData.minSalary}
                                                    onChange={handleJobChange}
                                                    placeholder="30000"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Max Salary (₹) *</label>
                                                <input
                                                    type="number"
                                                    name="maxSalary"
                                                    value={jobData.maxSalary}
                                                    onChange={handleJobChange}
                                                    placeholder="50000"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Location & Experience */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Job Location *</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="location"
                                                        value={jobData.location}
                                                        onChange={handleJobChange}
                                                        placeholder="e.g. Bangalore, Remote"
                                                        className="w-full p-3 pl-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                        required
                                                    />
                                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Experience Level *</label>
                                                <select
                                                    name="experienceLevel"
                                                    value={jobData.experienceLevel}
                                                    onChange={handleJobChange}
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                >
                                                    <option value="Fresher">Fresher</option>
                                                    <option value="1-3 Years">1-3 Years</option>
                                                    <option value="3-5 Years">3-5 Years</option>
                                                    <option value="5+ Years">5+ Years</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Type & Vacancies */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Job Type *</label>
                                                <select
                                                    name="jobType"
                                                    value={jobData.jobType}
                                                    onChange={handleJobChange}
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                >
                                                    <option value="Full Time">Full Time</option>
                                                    <option value="Part Time">Part Time</option>
                                                    <option value="Contract">Contract</option>
                                                    <option value="Internship">Internship</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-gray-700">Vacancies</label>
                                                <input
                                                    type="number"
                                                    name="vacancies"
                                                    value={jobData.vacancies}
                                                    onChange={handleJobChange}
                                                    placeholder="1"
                                                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Disclaimer */}
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                id="safetyDisclaimer"
                                                checked={jobData.disclaimerChecked}
                                                onChange={handleCheckboxChange}
                                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                            />
                                            <label htmlFor="safetyDisclaimer" className="text-sm text-blue-800 cursor-pointer">
                                                I confirm this job is genuine and does not ask for any money from candidates. I understand that posting fake jobs will lead to a permanent ban.
                                            </label>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isPosting}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {isPosting ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" /> Publishing...
                                                </>
                                            ) : (
                                                "Post Verified Job"
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===================== MY POSTED JOBS TAB ===================== */}
                    {activeTab === 'my-jobs' && (
                        <div className="animate-fade-in">
                            {myJobs.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No Jobs Posted Yet</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                                        Start hiring by posting your first job in the 'Post Jobs' tab.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {myJobs.map((job) => (
                                        <div key={job.id} className={`bg-white rounded-xl border p-6 transition-all ${job.isHidden ? 'border-gray-200 bg-gray-50 opacity-75' : 'border-gray-200 hover:shadow-md'}`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                                        {job.status === 'rejected' && (
                                                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <XCircle size={12} /> Rejected
                                                            </span>
                                                        )}
                                                        {job.status === 'approved' && (
                                                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <CheckCircle2 size={12} /> Live
                                                            </span>
                                                        )}
                                                        {job.status === 'pending' && (
                                                            <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Clock size={12} /> Under Review
                                                            </span>
                                                        )}
                                                        {job.isHidden && (
                                                            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                                                <EyeOff size={12} /> Hidden
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                                                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                                        <span className="flex items-center gap-1"><IndianRupee size={14} /> {job.salary}</span>
                                                        <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                                                        <span className="flex items-center gap-1"><Clock size={14} /> Posted: {job.postedDate}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => handleToggleVisibility(e, job)}
                                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title={job.isHidden ? "Show Job" : "Hide Job"}
                                                        disabled={togglingJobId === job.id}
                                                    >
                                                        {togglingJobId === job.id ? <Loader2 size={20} className="animate-spin" /> : (job.isHidden ? <EyeOff size={20} /> : <Eye size={20} />)}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteJob(e, job.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Job"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===================== APPLICATIONS TAB ===================== */}
                    {activeTab === 'applications' && (
                        <div className="animate-fade-in">
                            {localApplications.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                        <Users className="text-gray-400" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No Applications Yet</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mt-2">
                                        When job seekers apply to your posted jobs, they will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-gray-900">Received Applications ({localApplications.length})</h2>
                                    </div>

                                    {localApplications.map((app) => (
                                        <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                                        {app.applicantName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">{app.applicantName}</h3>
                                                        <p className="text-sm text-gray-500">Applied for <span className="font-semibold text-blue-600">{app.jobTitle}</span></p>

                                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                                            <div className="flex items-center gap-1.5">
                                                                <Mail size={14} /> {app.applicantEmail}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Phone size={14} /> {app.applicantPhone}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText size={14} /> {app.resumeName}
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar size={14} /> Applied: {app.appliedDate}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                                                            app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {app.status}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                                                {app.status !== 'Rejected' && (
                                                    <button
                                                        onClick={() => handleShortlist(app.id)}
                                                        disabled={app.status === 'Shortlisted'}
                                                        className={`flex-1 font-bold py-2 rounded-lg transition-colors ${app.status === 'Shortlisted'
                                                                ? 'bg-green-600 text-white cursor-default'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                            }`}
                                                    >
                                                        {app.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
                                                    </button>
                                                )}

                                                {app.status !== 'Rejected' && (
                                                    <button
                                                        onClick={() => handleReject(app.id)}
                                                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 rounded-lg transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {app.status === 'Rejected' && (
                                                    <div className="flex-1 bg-red-100 text-red-700 font-bold py-2 rounded-lg text-center flex items-center justify-center">
                                                        Rejected
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => handleViewResume(app)}
                                                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FileText size={16} /> View Resume
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {jobToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-fade-in">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Job Post?</h3>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Are you sure you want to delete this job? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setJobToDelete(null)}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={deletingJobId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteJob}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                disabled={deletingJobId !== null}
                            >
                                {deletingJobId ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resume Viewer Modal */}
            {viewingApplication && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                            <button onClick={closeResumeViewer} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            {/* Candidate Profile */}
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
                                    {viewingApplication.applicantName.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900">{viewingApplication.applicantName}</h3>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Mail size={14} /> {viewingApplication.applicantEmail}
                                    </p>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Phone size={14} /> {viewingApplication.applicantPhone}
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Applied for <span className="font-semibold text-blue-600">{viewingApplication.jobTitle}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Resume Mock View */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                                <p className="font-bold text-gray-900 mb-1">{viewingApplication.resumeName}</p>
                                <p className="text-sm text-gray-500 mb-6">PDF Document</p>

                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 mx-auto">
                                    <Download size={18} /> Download Resume
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                {viewingApplication.status !== 'Rejected' && (
                                    <button
                                        onClick={() => {
                                            handleShortlist(viewingApplication.id);
                                            closeResumeViewer();
                                        }}
                                        disabled={viewingApplication.status === 'Shortlisted'}
                                        className={`flex-1 font-bold py-3 rounded-xl transition-colors ${viewingApplication.status === 'Shortlisted'
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                            }`}
                                    >
                                        {viewingApplication.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist Candidate'}
                                    </button>
                                )}
                                {viewingApplication.status !== 'Rejected' && (
                                    <button
                                        onClick={() => {
                                            handleReject(viewingApplication.id);
                                            closeResumeViewer();
                                        }}
                                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-colors"
                                    >
                                        Reject Candidate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EmployerDashboard;