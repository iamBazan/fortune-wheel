/**
 * Firebase bootstrap + realtime helpers.
 * Paste your Firebase configuration in FIREBASE_CONFIG.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  databaseURL: "PASTE_DATABASE_URL",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID",
};

const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

// Single shared state for booth instance.
const spinRef = ref(db, "fortuneWheel/currentSpin");

export function watchSpinState(callback) {
  return onValue(spinRef, (snapshot) => callback(snapshot.val()));
}

export async function publishSpinStart(payload) {
  await set(spinRef, {
    ...payload,
    animationState: "spinning",
    startedAt: Date.now(),
    updatedAt: Date.now(),
    serverStartedAt: serverTimestamp(),
  });
}

export async function publishSpinProgress({ currentAngle, spinVelocity }) {
  await update(spinRef, {
    currentAngle,
    spinVelocity,
    updatedAt: Date.now(),
  });
}

export async function publishSpinEnd({ resultIndex, finalResult, finalAngle }) {
  await update(spinRef, {
    resultIndex,
    finalResult,
    finalAngle,
    animationState: "finished",
    finishedAt: Date.now(),
    updatedAt: Date.now(),
    serverFinishedAt: serverTimestamp(),
  });
}

export async function resetSpinState() {
  await set(spinRef, {
    animationState: "idle",
    updatedAt: Date.now(),
    resetAt: Date.now(),
  });
}
