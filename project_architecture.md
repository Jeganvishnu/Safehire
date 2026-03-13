# SafeHire India Project Architecture

Here is the top-to-bottom architecture and data flow diagram of the SafeHire India platform, outlining how users interact with the frontend, and how it connects to the backend and external services.

```mermaid
graph TD
    %% Users
    JobSeeker(("Job Seeker"))
    Employer(("Employer"))
    Admin(("Administrator"))

    %% Frontend App
    subgraph FrontendApp ["Frontend Application - React/Vite"]
        Auth["Authentication & Registration"]
        
        subgraph Portals
            SeekerPortal["Job Seeker Portal\n- Browse Jobs\n- Apply\n- Report Scams"]
            EmployerPortal["Employer Portal\n- Post Jobs\n- Track Applicants"]
            AdminPortal["Admin Dashboard\n- Review Flagged Jobs\n- Ban Users"]
        end
    end

    %% Backend Services
    subgraph Backend ["Firebase Services"]
        FirebaseAuth[("Firebase Auth")]
        Firestore[("Cloud Firestore")]
    end

    %% External APIs
    subgraph External ["External APIs"]
        Gemini["Gemini AI / OpenRouter"]
        Cloudinary["Cloudinary Storage"]
        ReCaptcha["Google reCAPTCHA v2"]
    end

    %% User Interactions
    JobSeeker --> |"Login/Register"| Auth
    Employer --> |"Login/Register"| Auth
    Admin --> |"Secure Login"| Auth

    Auth -.-> |"Verify Human"| ReCaptcha
    Auth ==> |"Authenticate"| FirebaseAuth

    JobSeeker ==> |"Access"| SeekerPortal
    Employer ==> |"Access"| EmployerPortal
    Admin ==> |"Access"| AdminPortal

    %% Seeker Flows
    SeekerPortal --> |"Upload Resume (.pdf)"| Cloudinary
    SeekerPortal --> |"Apply to Job / Report Job"| Firestore

    %% Employer Flows
    EmployerPortal --> |"Create Job Posting"| Firestore

    %% Triggered Automations / Admin Flows
    Firestore --> |"Trigger AI Review on New Job"| Gemini
    Gemini --> |"Returns Risk Score"| Firestore

    AdminPortal --> |"Review AI Flagged Jobs"| Firestore
    AdminPortal --> |"Ban Malicious Users"| FirebaseAuth
    AdminPortal --> |"Hide Suspicious Jobs"| Firestore

    %% Styling
    classDef primary fill:#4f46e5,stroke:#fff,stroke-width:2px,color:#fff;
    classDef secondary fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef danger fill:#ef4444,stroke:#fff,stroke-width:2px,color:#fff;
    classDef backend fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#8b5cf6,stroke:#fff,stroke-width:2px,color:#fff;

    class JobSeeker,Employer,Admin primary;
    class SeekerPortal,EmployerPortal,AdminPortal secondary;
    class FirebaseAuth,Firestore backend;
    class Gemini,Cloudinary,ReCaptcha external;
```
