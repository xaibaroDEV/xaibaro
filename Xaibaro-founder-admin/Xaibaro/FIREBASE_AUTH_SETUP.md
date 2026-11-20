# Xaibaro Firebase email authentication setup

The sign-in and registration interface is prepared, but Firebase must be configured before it can create real accounts.

## 1. Create a Firebase project
1. Open https://console.firebase.google.com/ and create a project for Xaibaro.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General**, add a Web app and copy its Firebase configuration.
4. In **Build → Firestore Database**, create a database. Start in production mode.

## 2. Add the web configuration
Open `firebase-config.js` and replace the four placeholder values:
- `apiKey`
- `authDomain`
- `projectId`
- `appId`

These Firebase web-app configuration values are designed to be present in browser code. Never put a Firebase Admin SDK private key, service-account JSON, or other server secret in this repository.

## 3. Set the Firestore security rules
Open `firestore.rules` in this folder. In **Firestore Database → Rules**, replace the starter rules with the contents of that file and click **Publish**. These rules ensure each signed-in user can access only their own progress document.

## 4. Authorize the website domain
In Firebase Authentication settings, add the domain where Xaibaro will be hosted to **Authorized domains**. Use HTTPS for the deployed site.

## 5. Test
- Create an account with an email address you can access.
- Confirm the verification email arrives.
- Sign out and sign back in.
- Complete a lesson or earn XP, then refresh the page.
- Sign in on another device/browser and check that the same progress appears.
- Try the password reset email.

## What is synced
When Firebase is configured and Firestore rules are published, Xaibaro syncs each signed-in user’s progress (XP, coins, completed lessons, streaks, quests, achievements, and profile settings) to their own Firestore document. If the user has no cloud record yet, their current browser save is copied to the cloud on first sign-in.

The leaderboard is still a sample preview; it is not a shared live leaderboard. Admin moderation is also not enabled. Never put Firebase Admin SDK private keys, service-account JSON, or other server secrets in this repository.
