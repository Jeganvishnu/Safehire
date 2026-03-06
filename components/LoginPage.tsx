import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowLeft, User, Loader2, AlertCircle, CheckCircle, Building2, Settings, Eye, EyeOff } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginPageProps {
  onNavigate: (view: 'home' | 'jobs' | 'how-it-works' | 'login') => void;
  onLoginSuccess: (role: 'job-seeker' | 'employer' | 'admin') => void;
}

type UserRole = 'job-seeker' | 'employer' | 'admin';
type AuthMode = 'login' | 'signup' | 'google-signup';

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('job-seeker');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear errors when switching modes
  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
    setGoogleUser(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaValue) {
      setError("Please complete the CAPTCHA to verify you are not a robot.");
      return;
    }

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
          const userData = userDoc.data();
          if (userData.isBanned) {
            await auth.signOut();
            throw new Error("This account has been banned due to policy violations.");
          }
          actualRole = userData.role as UserRole;
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
      if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address (e.g., name@example.com).");
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError("Invalid credentials. If you signed in with Google previously, your password was disabled. Use Google Sign-In or click 'Forgot password?'.");
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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let actualRole: UserRole = activeRole;

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.isBanned) {
          await auth.signOut();
          throw new Error("This account has been banned due to policy violations.");
        }
        actualRole = userData.role as UserRole;
        setSuccessMessage(`Login successful! Redirecting...`);
        setTimeout(() => {
          onLoginSuccess(actualRole);
        }, 800);
      } else {
        // Sign up with Google, transition to set password
        setGoogleUser(user);
        setUsername(user.displayName || user.email?.split('@')[0] || '');
        setAuthMode('google-signup');
      }

    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Google sign-in was cancelled.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("Domain not authorized. Please add this URL/IP to Firebase Console > Authentication > Settings > Authorized Domains.");
      } else {
        setError(err.message || "An unexpected error occurred during Google Sign-in.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaValue) {
      setError("Please complete the CAPTCHA to verify you are not a robot.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (auth.currentUser && googleUser) {
        await updatePassword(auth.currentUser, password);
        await updateProfile(auth.currentUser, { displayName: username });

        await setDoc(doc(db, "users", googleUser.uid), {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: username,
          createdAt: new Date().toISOString(),
          role: activeRole,
          photoURL: googleUser.photoURL
        });

        setSuccessMessage("Account setup complete! Redirecting...");
        setTimeout(() => {
          onLoginSuccess(activeRole);
        }, 800);
      }
    } catch (err: any) {
      console.error("Setup Error:", err);
      setError(err.message || "Failed to complete setup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address in the Email field to reset your password.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Check your inbox to set a new password.");
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      setError(err.message || "Failed to send reset email.");
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
            {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Complete Setup'}
          </h1>
          <p className="text-gray-500 text-sm">
            {authMode === 'login' ? 'Sign in to your SafeHire account' : authMode === 'signup' ? 'Join SafeHire India today' : 'Set a password for your new account'}
          </p>
        </div>

        {/* Role Selection Tabs */}
        {authMode !== 'google-signup' && (
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
              {authMode === 'login' ? 'Sign in as' : 'Register as'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setActiveRole('job-seeker')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${activeRole === 'job-seeker'
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <User size={20} />
                <span className="text-xs font-semibold">Job Seeker</span>
              </button>

              <button
                onClick={() => setActiveRole('employer')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${activeRole === 'employer'
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Building2 size={20} />
                <span className="text-xs font-semibold">Employer</span>
              </button>

              <button
                onClick={() => setActiveRole('admin')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${activeRole === 'admin'
                  ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-gray-900'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Settings size={20} />
                <span className="text-xs font-semibold">Admin</span>
              </button>
            </div>
          </div>
        )}

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
        <form onSubmit={authMode === 'google-signup' ? handleGoogleSignupCompletion : handleAuth} className="space-y-5">

          {/* Username (Signup Only) */}
          {(authMode === 'signup' || authMode === 'google-signup') && (
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
          {authMode !== 'google-signup' && (
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
          )}
          {authMode === 'google-signup' && googleUser && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={googleUser.email || ''}
                  disabled
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              {authMode === 'login' && (
                <button type="button" onClick={handleResetPassword} className="text-xs text-blue-600 font-semibold hover:underline">
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

          {/* Confirm Password (Google Signup Only) */}
          {authMode === 'google-signup' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* reCAPTCHA */}
          <div className="flex justify-center mt-4">
            <ReCAPTCHA
              sitekey="6LfuYH8sAAAAAARLFiqx7-89sJxGUnP1yVCJK8ff"
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Complete Setup')}
          </button>

          {/* Social Login Separator */}
          {authMode !== 'google-signup' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                  <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                  <path d="M5.50253 14.3003C5.00317 12.8099 5.00317 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04" />
                  <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
                </svg>
                {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
            </>
          )}
        </form>

        {/* Toggle Mode */}
        {authMode !== 'google-signup' && (
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
        )}

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