# SafeHire India

SafeHire India is a secure, intelligent, and "100% Scam-Free" job portal platform built with React, Vite, Tailwind CSS, and powered by Firebase and Google's Gemini AI. The platform provides a unique proposition by proactively scanning and flagging fraudulent job descriptions to protect job seekers.

## 🚀 Features

### 👤 For Job Seekers
* **Advanced Job Search**: Browse verified and approved jobs.
* **Seamless Authentication**: Sign up and login using Email/Password or Google Sign-In.
* **Easy Applications**: Apply for jobs natively by uploading a PDF resume.
* **Community Safety**: Report suspicious job postings or employers directly. If a company receives 3 reports, its jobs are automatically hidden from the public feed!

### 🏢 For Employers
* **Company Registration**: Dedicated onboarding flow for genuine employers.
* **Job Posting & Management**: Post new job opportunities and manage statuses.
* **Applicant Tracking**: View resumes and track candidates directly from the Employer Dashboard.

### 🛡️ For Administrators
* **Intelligent Dashboard**: Collapsible sidebar, realtime metrics, and analytics overview.
* **AI Risk Review System**: Uses Gemini AI to automatically calculate risk scores for new job postings. Suspicious jobs (asking for money, WhatsApp contacts, etc.) are flagged.
* **AI Flagged Jobs Board**: A dedicated board to quickly review, accept, or ban high-risk AI-flagged jobs.
* **Employer Verification**: Manually approve or reject companies from the platform.
* **User Reports Management**: Monitor community reports and permanently ban malicious employers (automatically clearing their jobs and active sessions).

### 🔒 Security & Performance Features
* **Google reCAPTCHA v2**: Mandatory human verification on login, registration, and job applications to block bots.
* **Cross-Session Ban Enforcement**: Banned employers are instantly detected and logged out globally, with their credentials completely disabled.
* **Robust Password Recovery**: Forgot password reset workflows and graceful handling of Google vs. Password authentication collisions.
* **Optimized Production Builds**: Custom Vite code-splitting and chunking for fast load times.

## 🛠️ Tech Stack

* **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide React (Icons)
* **Backend Services**: Firebase Authentication, Cloud Firestore (Database)
* **AI Integration**: Google Gemini API (`@google/genai` or standard endpoints)
* **Security**: Google reCAPTCHA v2

## ⚙️ Running Locally

1. **Prerequisites**: Make sure you have Node.js installed.
2. **Clone/Navigate** to your project directory.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   Create a `.env` (or `.env.local`) file in the root directory and add your Firebase and Gemini credentials.
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. **Add Localhost to Firebase Auth**: 
   Ensure your local testing URL/IP (e.g., `127.0.0.1` or `localhost`) is added in your **Firebase Console -> Authentication -> Settings -> Authorized Domains**.
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```
This will compile the application into the `dist` folder, resolving dependency sizes using Vite's manual chunks splitting configuration.

---
*Built with ❤️ to keep job seekers safe in India.*
