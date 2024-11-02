# Restaurant Virtual Assistant

This project includes a Firebase Cloud Function that needs to be deployed separately.

## Prerequisites

Before deploying the Firebase functions, you need to set up the correct permissions:

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to IAM & Admin > IAM
4. Click the "+ GRANT ACCESS" button at the top
5. In the "New principals" field, enter: `799763027243-compute@developer.gserviceaccount.com`
6. Click "Select a role" and add these roles one by one:
   - Cloud Functions Invoker (`roles/cloudfunctions.invoker`)
   - Storage Object Viewer (`roles/storage.objectViewer`)
   - Service Account User (`roles/iam.serviceAccountUser`)
   - Cloud Functions Developer (`roles/cloudfunctions.developer`)
   - Cloud Build Service Account (`roles/cloudbuild.builds.builder`)
   - Cloud Build Viewer (`roles/cloudbuild.builds.viewer`)
   - Security Admin (`roles/iam.securityAdmin`)
7. Click "SAVE"

Additionally, you need to:

1. Enable the Cloud Build API:
   - Go to the [Cloud Build API page](https://console.cloud.google.com/apis/library/cloudbuild.googleapis.com)
   - Click "Enable" if it's not already enabled

2. Grant IAM Policy permissions to your account:
   - Go to IAM & Admin > IAM
   - Find your account (the one you use with Firebase CLI)
   - Click the pencil icon to edit
   - Add these roles:
     - Cloud Functions Admin (`roles/cloudfunctions.admin`)
     - Firebase Admin (`roles/firebase.admin`)
     - Security Admin (`roles/iam.securityAdmin`)
   - Click "Save"

## Deploying the Firebase Function

To deploy the Firebase function, follow these steps:

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init functions
   ```
   - Select your project when prompted
   - Choose JavaScript
   - Say yes to ESLint
   - Say yes to installing dependencies

4. Navigate to the project directory and install dependencies:
   ```bash
   cd functions
   npm install
   ```

5. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

## Development

For local development and testing, you can use Firebase emulators:

1. Start the emulators:
   ```bash
   firebase emulators:start
   ```

2. Your function will be available locally for testing.

## Troubleshooting

If you encounter deployment errors:

1. Verify all required roles are set up correctly:
   
   For the service account (`799763027243-compute@developer.gserviceaccount.com`):
   - Cloud Functions Invoker
   - Storage Object Viewer
   - Service Account User
   - Cloud Functions Developer
   - Cloud Build Service Account
   - Cloud Build Viewer
   - Security Admin

   For your account (Firebase CLI user):
   - Cloud Functions Admin
   - Firebase Admin
   - Security Admin

2. Make sure the Cloud Build API is enabled
3. Make sure you're logged in with the correct Firebase account
4. Check that your project ID in `.firebaserc` matches your Firebase project
5. If you get IAM Policy errors:
   ```bash
   firebase logout
   firebase login
   firebase use your-project-id
   gcloud auth application-default login  # Make sure you're authenticated with gcloud
   firebase deploy --only functions
   ```

6. If issues persist, try:
   ```bash
   # Clear Firebase cache
   firebase logout
   rm -rf ~/.config/configstore/firebase-tools
   firebase login
   
   # Redeploy
   firebase deploy --only functions
   ```

Remember to update any environment variables or configuration settings in your local Firebase project before deploying.