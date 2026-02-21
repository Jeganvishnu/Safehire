import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, User, Loader2, AlertCircle, CheckCircle, Building2, Settings, Eye, EyeOff } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'jobs' | 'how-it-works' | 'login') => void;
  onLoginSuccess: (role: 'job-seeker' | 'employer' | 'admin') => void;
}

type UserRole = 'job-seeker' | 'employer' | 'admin';
type AuthMode = 'login' | 'signup';

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('job-seeker');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear errors when switching modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmedEmail = email.trim();

    try {
      if (authMode === 'login') {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const user = userCredential.user;

        // Fetch the actual role from Firestore to ensure correctness
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let actualRole: UserRole = activeRole;
        
        if (userDoc.exists()) {
          actualRole = userDoc.data().role as UserRole;
        }

        setSuccessMessage("Login successful! Redirecting...");
        
        setTimeout(() => {
          onLoginSuccess(actualRole);
        }, 800);

      } else {
        // --- SIGNUP LOGIC ---
        if (password.length < 6) {
           throw new Error("Password must be at least 6 characters");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: username });
        
        // Store user role in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: trimmedEmail,
          displayName: username,
          createdAt: new Date().toISOString(),
          role: activeRole // Save the selected role
        });

        setSuccessMessage(`Account created as ${activeRole === 'job-seeker' ? 'Job Seeker' : activeRole === 'employer' ? 'Employer' : 'Admin'}!`);
        
        setTimeout(() => {
           onLoginSuccess(activeRole);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Auth Error:", err.code, err.message);
      
      // auth/invalid-credential is the generic error for v10+ login failures
      if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password authentication is not enabled for this project.");
      } else {
        setError(err.message || "An unexpected authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      {/* Back Link */}
      <div className="w-full max-w-[440px] mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 md:p-10 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-8">
           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
             {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
           </h1>
           <p className="text-gray-500 text-sm">
             {authMode === 'login' ? 'Sign in to your SafeHire account' : 'Join SafeHire India today'}
           </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mb-8">
           <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
             {authMode === 'login' ? 'Sign in as' : 'Register as'}
           </label>
           <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setActiveRole('job-seeker')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  activeRole === 'job-seeker' 
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                 <User size={20} />
                 <span className="text-xs font-semibold">Job Seeker</span>
              </button>

              <button 
                onClick={() => setActiveRole('employer')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  activeRole === 'employer' 
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                 <Building2 size={20} />
                 <span className="text-xs font-semibold">Employer</span>
              </button>

              <button 
                onClick={() => setActiveRole('admin')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  activeRole === 'admin' 
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900' 
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                 <Settings size={20} />
                 <span className="text-xs font-semibold">Admin</span>
              </button>
           </div>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-xs font-medium">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-xs font-medium">
            <CheckCircle size={14} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
           
           {/* Username (Signup Only) */}
           {authMode === 'signup' && (
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     type="text"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                     className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                     placeholder="John Doe"
                   />
                </div>
             </div>
           )}

           {/* Email */}
           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Mail className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                   placeholder="you@example.com"
                 />
              </div>
           </div>

           {/* Password */}
           <div>
              <div className="flex justify-between items-center mb-1.5">
                 <label className="block text-sm font-bold text-gray-700">Password</label>
                 {authMode === 'login' && (
                   <button type="button" className="text-xs text-blue-600 font-semibold hover:underline">
                      Forgot password?
                   </button>
                 )}
              </div>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Lock className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                   placeholder="••••••••"
                 />
                 <button 
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                 >
                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
              </div>
           </div>

           {/* Submit Button */}
           <button
             type="submit"
             disabled={isLoading}
             className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
           >
             {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
           </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
           <p className="text-sm text-gray-500">
             {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
             <button 
               onClick={() => switchMode(authMode === 'login' ? 'signup' : 'login')}
               className="text-[#1E293B] font-bold hover:underline"
             >
               {authMode === 'login' ? 'Register Free' : 'Sign In'}
             </button>
           </p>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="mt-8 text-center max-w-sm">
         <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
            <Shield size={12} className="text-emerald-500" />
            Protected by AI-powered fraud detection & 256-bit encryption
         </p>
      </div>
    </div>
  );
};

export default LoginPage;