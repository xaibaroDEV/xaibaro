# Xaibaro Firebase email authentication setup

The sign-in and registration interface is prepared, but Firebase must be configured before it can create real accounts.

## 1. Create a Firebase project
1. Open https://console.firebase.google.com/ and create a project for Xaibaro.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. In **Project settings → General**, add a Web app and copy its Firebase configuration.

## 2. Add the web configuration
Open `firebase-config.js` and replace the four placeholder values:
- `apiKey`
- `authDomain`
- `projectId`
- `appId`

These Firebase web-app configuration values are designed to be present in browser code. Never put a Firebase Admin SDK private key, service-account JSON, or other server secret in this repository.

## 3. Authorize the website domain
In Firebase Authentication settings, add the domain where Xaibaro will be hosted to **Authorized domains**. Use HTTPS for the deployed site.

## 4. Test
- Create an account with an email address you can access.
- Confirm the verification email arrives.
- Sign out and sign back in.
- Try the password reset email.

## Important current limitation
This first authentication step signs users in with Firebase. It does **not yet** move the existing browser-only XP, coins, lessons, or streak data into a secure cloud database. That needs a separate Firestore integration with security rules before calling the account system complete.
