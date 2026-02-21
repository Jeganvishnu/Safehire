# Deploying SafeHire India to Vercel

This document outlines the step-by-step process required to deploy this project up on Vercel.

## Prerequisites
1. You must have a **GitHub**, **GitLab**, or **Bitbucket** account.
2. The code for this project needs to be pushed to a repository on one of those platforms (GitHub is recommended).
3. Create a free account on [Vercel](https://vercel.com/) and sign in.

## Step 1: Push Project to GitHub

If you haven't pushed your code to GitHub yet, follow these steps in your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

*(Replace `<YOUR_GITHUB_REPO_URL>` with your actual repository URL).*

## Step 2: Import Project to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click the **"Add New..."** button and select **"Project"**.
3. You will see a list of your GitHub repositories. Find the repository you just pushed (e.g., `safehire-india`) and click **"Import"**.

## Step 3: Configure Deployment Details

Since this project uses **Vite**, Vercel should automatically detect the settings. Verify that the following configuration matches what Vercel has auto-populated:

* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install` (or leave default)

## Step 4: Add Environment Variables (If Applicable)

If your app uses Firebase or any API keys, scroll down to the **"Environment Variables"** section before clicking "Deploy". 
Add any keys from your local `.env` or `.env.local` file. 

* **Example:**
  * **Name:** `VITE_FIREBASE_API_KEY`
  * **Value:** `your-api-key-here`

*Note: Never upload your `.env` files to GitHub directly, only add them in the Vercel dashboard!*

## Step 5: Deploy 🚀

1. Click the **"Deploy"** button.
2. Wait a few moments while Vercel builds your project. It will run `npm install` and `npm run build`.
3. Once finished, you'll see a success screen with a preview of your website!

## Step 6: View the Live Site

Click the **"Continue to Dashboard"** button and you can visit your deployed site using the unique domain Vercel automatically generates for you, which you can also customize later.
