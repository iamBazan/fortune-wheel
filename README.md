# Fortune Wheel (T&M – taxm.pl)

Production-ready frontend-only web app for an event booth. It runs as WordPress subpages and synchronizes wheel spins in real time through Firebase Realtime Database.

## Project structure

```text
/wheel
  index.html
  mobile.html
  screen.html
  style.css
  wheel.js
  firebase.js
  confetti.js
```

## Features

- 2 modes:
  - **SCREEN** (`screen.html`) for TV/laptop display with dynamic QR code.
  - **MOBILE** (`mobile.html`) for participant interaction with swipe gesture.
- Canvas-rendered 16-segment wheel with premium minimalist visuals.
- GSAP-powered realistic inertia animation.
- Realtime synchronization through Firebase Realtime Database:
  - spin start
  - rotation angle
  - spin velocity
  - final result
  - animation state
- Secure randomness using `window.crypto.getRandomValues` (independent of animation).
- Web Audio API tick sounds on segment crossing.
- Confetti only for the main prize.
- Session lock in `sessionStorage` to prevent multiple active spins.

---

## Firebase configuration guide (step-by-step)

1. Open [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In project settings, create a **Web App**.
3. Enable **Realtime Database**:
   - Build → Realtime Database → Create Database.
   - Start in locked mode, then add booth rules.
4. In `wheel/firebase.js`, replace placeholder values in `FIREBASE_CONFIG`:

```js
const FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_AUTH_DOMAIN",
  databaseURL: "PASTE_DATABASE_URL",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID",
};
```

5. Add Realtime Database rules for event use (basic permissive booth mode):

```json
{
  "rules": {
    "fortuneWheel": {
      ".read": true,
      ".write": true
    }
  }
}
```

> For production internet exposure, restrict access by domain/IP/token strategy.

---

## WordPress deployment instructions

This app is frontend-only and works best as static files in a subfolder.

1. Create folder in your WordPress hosting path:
   - Example: `public_html/wheel/`
2. Upload all files from local `wheel/` into hosted `/wheel/`.
3. Ensure URLs are available:
   - `https://your-domain.pl/wheel/index.html`
   - `https://your-domain.pl/wheel/screen.html`
   - `https://your-domain.pl/wheel/mobile.html`
4. (Optional) Create a WordPress page (e.g. `/wheel`) and link/redirect to `/wheel/screen.html`.
5. At the booth:
   - Open `screen.html` on the big screen device.
   - Participants scan QR and open `mobile.html`.

---

## Booth operation flow

1. SCREEN mode displays wheel + dynamic QR.
2. Participant scans QR and opens MOBILE mode.
3. Participant taps START (unlocks audio on iOS).
4. Participant swipes to spin.
5. MOBILE selects cryptographically secure winner and publishes spin payload to Firebase.
6. SCREEN receives payload and runs synchronized animation.
7. End state (final result) is displayed on both devices.
8. Main prize triggers confetti.
9. SCREEN auto-resets after 5 seconds.

---

## Customization notes

- Segment texts: `wheel.js` → `SEGMENTS` array.
- Main prize trigger: `wheel.js` → `MAIN_PRIZE`.
- Branding/colors: `style.css` CSS variables.
- Wheel look & text layout: `wheel.js` renderer.
- Firebase node path: `firebase.js` (`fortuneWheel/currentSpin`).

