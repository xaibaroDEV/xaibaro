import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, sendPasswordResetEmail, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const root = document.getElementById("xaibaroAuthRoot");
document.querySelector("header nav")?.append(root);
const configReady = firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
  firebaseConfig.appId !== "YOUR_FIREBASE_APP_ID";

root.innerHTML = `
<style>
.xa-auth-btn{border:0;border-radius:10px;padding:9px 13px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer}
.xa-auth-overlay{position:fixed;inset:0;background:#071633aa;display:none;place-items:center;z-index:1000;padding:18px}
.xa-auth-overlay.open{display:grid}.xa-auth-card{background:#fff;color:#172554;border-radius:18px;padding:22px;width:min(410px,100%);box-shadow:0 20px 70px #0005}
.xa-auth-card h2{margin:0 0 8px}.xa-auth-card p{color:#64748b}.xa-auth-card label{display:block;font-weight:700;margin:12px 0 5px}
.xa-auth-card input{width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:9px;font:inherit}
.xa-auth-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.xa-auth-actions button{border:0;border-radius:9px;padding:10px 13px;font-weight:800;cursor:pointer}
.xa-auth-primary{background:#2563eb;color:white}.xa-auth-secondary{background:#eaf1ff;color:#1d4ed8}
#xaAuthMessage{min-height:22px;font-size:.9rem;margin-top:10px;color:#1d4ed8}
</style>
<button class="xa-auth-btn" id="xaAuthOpen" type="button">Sign in / Create account</button>
<div class="xa-auth-overlay" id="xaAuthOverlay" role="dialog" aria-modal="true" aria-labelledby="xaAuthTitle">
 <div class="xa-auth-card">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
   <h2 id="xaAuthTitle">Welcome to Xaibaro</h2><button id="xaAuthClose" aria-label="Close" class="xa-auth-secondary">✕</button>
  </div>
  <p id="xaAuthStatus">Sign in or create an account to get started.</p>
  <form id="xaAuthForm">
   <label for="xaAuthEmail">Email</label><input id="xaAuthEmail" type="email" autocomplete="email" required>
   <label for="xaAuthPassword">Password</label><input id="xaAuthPassword" type="password" minlength="6" autocomplete="current-password" required>
   <div class="xa-auth-actions">
    <button class="xa-auth-primary" type="submit" id="xaAuthSubmit">Sign in</button>
    <button class="xa-auth-secondary" type="button" id="xaAuthCreate">Create account</button>
   </div>
  </form>
  <div class="xa-auth-actions"><button class="xa-auth-secondary" id="xaAuthReset" type="button">Forgot password?</button><button class="xa-auth-secondary" id="xaAuthLogout" type="button" hidden>Sign out</button></div>
  <div id="xaAuthMessage" role="status" aria-live="polite"></div>
 </div>
</div>`;

const overlay=document.getElementById("xaAuthOverlay");
const form=document.getElementById("xaAuthForm");
const email=document.getElementById("xaAuthEmail");
const password=document.getElementById("xaAuthPassword");
const message=document.getElementById("xaAuthMessage");
const status=document.getElementById("xaAuthStatus");
const submit=document.getElementById("xaAuthSubmit");
const create=document.getElementById("xaAuthCreate");
const logout=document.getElementById("xaAuthLogout");
let mode="signin", auth=null, db=null, currentUser=null, cloudReady=false;

function say(text){message.textContent=text;}
function open(){overlay.classList.add("open");}
function close(){overlay.classList.remove("open");say("");}
function setMode(next){mode=next;submit.textContent=next==="signin"?"Sign in":"Create account";create.hidden=false;create.textContent=next==="signin"?"Create account":"Already have an account? Sign in";password.autocomplete=next==="signin"?"current-password":"new-password";say("");}
document.getElementById("xaAuthOpen").addEventListener("click",open);
document.getElementById("xaAuthClose").addEventListener("click",close);
overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
create.addEventListener("click",()=>setMode(mode==="signin"?"create":"signin"));
document.getElementById("xaAuthReset").addEventListener("click",async()=>{
 if(!configReady||!auth){say("Finish Firebase setup before using password reset.");return;}
 if(!email.value.trim()){say("Enter your email address first.");return;}
 try{await sendPasswordResetEmail(auth,email.value.trim());say("Password reset email sent. Check your inbox.");}
 catch(e){say(friendlyError(e));}
});
function friendlyError(e){
 const map={
 "auth/invalid-email":"Enter a valid email address.",
 "auth/user-not-found":"No account was found with that email.",
 "auth/wrong-password":"That password is incorrect.",
 "auth/invalid-credential":"Email or password is incorrect.",
 "auth/email-already-in-use":"An account already exists for that email.",
 "auth/weak-password":"Choose a stronger password (at least 6 characters).",
 "auth/too-many-requests":"Too many attempts. Please wait and try again.",
 "auth/network-request-failed":"Network error. Check your connection and try again."
 };
 return map[e.code]||"Something went wrong. Please try again.";
}
if(!configReady){
 say("Firebase setup is not finished yet. Add your Firebase web config in firebase-config.js.");
 submit.disabled=true;create.disabled=true;
} else {
 const app=initializeApp(firebaseConfig);
 auth=getAuth(app);
 db=getFirestore(app);
 window.addEventListener("xaibaro:state-save",async event=>{
  if(!currentUser||!cloudReady||!event.detail)return;
  try{await setDoc(doc(db,"users",currentUser.uid,"progress","main"),{state:event.detail,updatedAt:serverTimestamp()});}
  catch(error){console.error("Xaibaro cloud save failed:",error);say("Progress is saved on this device, but cloud sync failed. Check your connection.");}
 });
 onAuthStateChanged(auth,async user=>{
  currentUser=user;
  cloudReady=false;
  if(user){
   status.textContent=user.emailVerified?"Signed in as "+user.email:"Signed in, but please verify "+user.email;
   logout.hidden=false;
   document.getElementById("xaAuthOpen").textContent="Account";
   submit.hidden=true;create.hidden=true;
   if(!user.emailVerified) say("Check your email for the verification link.");
   try{
    const progressRef=doc(db,"users",user.uid,"progress","main");
    const snapshot=await getDoc(progressRef);
    if(snapshot.exists()){
     const saved=snapshot.data()?.state;
     if(saved&&typeof saved==="object") window.dispatchEvent(new CustomEvent("xaibaro:cloud-load",{detail:{state:saved}}));
    }else{
     const localState=JSON.parse(localStorage.getItem("xaibaroSave")||"{}");
     await setDoc(progressRef,{state:localState,updatedAt:serverTimestamp()});
    }
    cloudReady=true;
    say("Cloud sync is on. Your progress is linked to this account.");
   }catch(error){
    console.error("Xaibaro cloud load failed:",error);
    say("Signed in, but cloud sync needs setup. Check the Firestore database and security rules.");
   }
  }else{
   status.textContent="Sign in or create an account to get started.";
   logout.hidden=true;submit.hidden=false;create.hidden=false;
   document.getElementById("xaAuthOpen").textContent="Sign in / Create account";
  }
 });
 form.addEventListener("submit",async e=>{
  e.preventDefault();say("");
  try{
   if(mode==="create"){
    const result=await createUserWithEmailAndPassword(auth,email.value.trim(),password.value);
    await sendEmailVerification(result.user);
    say("Account created! Check your email to verify it.");
   }else{
    await signInWithEmailAndPassword(auth,email.value.trim(),password.value);
    say("Signed in successfully.");
   }
  }catch(err){say(friendlyError(err));}
 });
 logout.addEventListener("click",async()=>{try{await signOut(auth);say("You have signed out.");setMode("signin");}catch(e){say(friendlyError(e));}});
}
