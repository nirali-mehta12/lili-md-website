import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/*
  ============================================================
  Firebase Admin (server-side only — never import in client code)
  ------------------------------------------------------------
  Two ways to authenticate:

  1. Local dev / any host — service account via env vars:
       FIREBASE_PROJECT_ID
       FIREBASE_CLIENT_EMAIL
       FIREBASE_PRIVATE_KEY      (keep the literal \n in the .env value)

  2. Firebase App Hosting — Application Default Credentials are
     present automatically, so just FIREBASE_PROJECT_ID is enough
     (or nothing, if the platform sets GOOGLE_CLOUD_PROJECT).

  If NOTHING is configured, getDb() returns null and the API route
  falls back to "placeholder mode" (logs the lead, still returns
  success) so the form is testable locally before Firebase is set up.
  ============================================================
*/

let cachedDb: Firestore | null | undefined;

function initApp(): App | null {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Full service account in env → use it.
  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // App Hosting / GCP / local `gcloud auth application-default login`
  // → keyless Application Default Credentials. Pass projectId so the
  //   SDK targets the right project even with user-based ADC.
  if (projectId || process.env.GOOGLE_CLOUD_PROJECT) {
    return initializeApp(projectId ? { projectId } : undefined);
  }

  // Nothing configured → placeholder mode.
  return null;
}

export function getDb(): Firestore | null {
  if (cachedDb !== undefined) return cachedDb;
  const app = initApp();
  cachedDb = app ? getFirestore(app) : null;
  return cachedDb;
}
