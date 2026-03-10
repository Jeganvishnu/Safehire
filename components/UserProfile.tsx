import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Shield, Building2, Briefcase, Settings, Camera, Loader2, FileText, Save, Phone, GraduationCap, Code } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { uploadResume } from '../utils/cloudinaryUpload';
import { extractTextFromPdf, parseResumeWithAI } from '../utils/resumeParser';

interface UserProfileProps {
    currentUser: any;
    userRole: 'job-seeker' | 'employer' | 'admin';
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, userRole }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [photoUrl, setPhotoUrl] = useState(currentUser?.photoURL || '');
    const [userDetails, setUserDetails] = useState({
        phone: '',
        skills: '',
        experience: '',
        education: '',
        bio: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resumeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser?.photoURL) {
            setPhotoUrl(currentUser.photoURL);
        }

        const fetchUserData = async () => {
            if (currentUser?.uid) {
                const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserDetails({
                        phone: data.phone || '',
                        skills: data.skills || '',
                        experience: data.experience || '',
                        education: data.education || '',
                        bio: data.bio || ''
                    });
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    if (!currentUser) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploading(true);
            const downloadURL = await uploadResume(file);

            await updateProfile(currentUser, { photoURL: downloadURL });

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { photoURL: downloadURL });

            setPhotoUrl(downloadURL);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (userRole !== 'job-seeker') return;

        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF format resume for smart parsing.');
            return;
        }

        try {
            setIsParsingResume(true);
            const text = await extractTextFromPdf(file);
            const extracted = await parseResumeWithAI(text);

            setUserDetails((prev) => ({
                phone: extracted.phone || prev.phone,
                skills: extracted.skills || prev.skills,
                experience: extracted.experience || prev.experience,
                education: extracted.education || prev.education,
                bio: extracted.bio || prev.bio
            }));

            alert('Resume read successfully! Your details have been auto-filled below. Please review and click Save.');
        } catch (error) {
            console.error("Parsing Error:", error);
            alert('Could not automatically read details from this resume. You can still enter your details manually.');
        } finally {
            setIsParsingResume(false);
            if (resumeInputRef.current) resumeInputRef.current.value = '';
        }
    };

    const handleSaveDetails = async () => {
        try {
            setIsSaving(true);
            await updateDoc(doc(db, 'users', currentUser.uid), {
                phone: userDetails.phone,
                skills: userDetails.skills,
                experience: userDetails.experience,
                education: userDetails.education,
                bio: userDetails.bio
            });
            alert('Profile details updated successfully!');
        } catch (error) {
            console.error("Save Error:", error);
            alert('Failed to update details. Make sure you are logged in correctly.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header/Cover */}
                <div className="h-32 bg-emerald-500 rounded-t-2xl"></div>

                {/* Profile Info */}
                <div className="px-8 pb-8 flex flex-col items-center -mt-16 text-center">
                    <div className="relative w-32 h-32 mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-full h-full bg-white rounded-full p-1.5 shadow-lg relative">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                {photoUrl ? (
                                    <img
                                        src={photoUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl font-bold">
                                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : <User size={48} />}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className={`absolute inset-0 bg-black flex items-center justify-center text-white transition-opacity duration-200 ${isUploading ? 'bg-opacity-50 opacity-100' : 'bg-opacity-40 opacity-0 group-hover:opacity-100'}`}>
                                    {isUploading ? <Loader2 className="animate-spin" size={28} /> : <Camera size={28} />}
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {currentUser.displayName || 'SafeHire User'}
                    </h1>
                    <p className="text-gray-500 text-lg mb-6 flex items-center justify-center gap-2">
                        <Mail size={18} />
                        {currentUser.email}
                    </p>

                    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start gap-4">
                            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600 bg-opacity-80">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Account Status</p>
                                <p className="text-lg font-semibold text-gray-900">Active</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600 bg-opacity-80">
                                {userRole === 'admin' ? <Settings size={24} /> : userRole === 'employer' ? <Building2 size={24} /> : <Briefcase size={24} />}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Account Role</p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">
                                    {userRole.replace('-', ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-start gap-4 md:col-span-2">
                            <div className="bg-purple-100 p-3 rounded-lg text-purple-600 bg-opacity-80">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Account ID</p>
                                <p className="text-sm font-semibold text-gray-900 break-all font-mono mt-1">
                                    {currentUser.uid}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Job Seeker Only View */}
                    {userRole === 'job-seeker' && (
                        <div className="w-full max-w-2xl mt-12 text-left">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Professional Details</h2>
                                    <p className="text-sm text-gray-500">Update your details or auto-fill them from your resume.</p>
                                </div>
                                <div className="shrink-0">
                                    <input type="file" ref={resumeInputRef} accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                                    <button
                                        onClick={() => resumeInputRef.current?.click()}
                                        disabled={isParsingResume}
                                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                                    >
                                        {isParsingResume ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                        {isParsingResume ? 'Reading Resume...' : 'Auto-fill with Resume'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-5 shadow-sm">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Professional Bio</label>
                                    <textarea
                                        value={userDetails.bio}
                                        onChange={(e) => setUserDetails({ ...userDetails, bio: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                        rows={3}
                                        placeholder="A brief summary of your professional background, goals, and what you are looking for..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Phone size={14} className="text-gray-400" /> Phone Number</label>
                                        <input
                                            type="tel"
                                            value={userDetails.phone}
                                            onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Briefcase size={14} className="text-gray-400" /> Experience</label>
                                        <input
                                            type="text"
                                            value={userDetails.experience}
                                            onChange={(e) => setUserDetails({ ...userDetails, experience: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                            placeholder="e.g. 3 Years, Fresher..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><GraduationCap size={14} className="text-gray-400" /> Education</label>
                                        <input
                                            type="text"
                                            value={userDetails.education}
                                            onChange={(e) => setUserDetails({ ...userDetails, education: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                            placeholder="e.g. B.Tech in Computer Science"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2"><Code size={14} className="text-gray-400" /> Top Skills</label>
                                        <input
                                            type="text"
                                            value={userDetails.skills}
                                            onChange={(e) => setUserDetails({ ...userDetails, skills: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                                            placeholder="React, Node.js, Python, UI/UX..."
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-5 flex justify-end">
                                    <button
                                        onClick={handleSaveDetails}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {isSaving ? 'Saving...' : 'Save Profile Details'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
