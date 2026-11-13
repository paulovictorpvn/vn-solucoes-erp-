import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export const WORKSPACE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
];

export const googleAuthProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  googleAuthProvider.addScope(scope);
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedIdToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, accessToken: string | null, idToken: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        cachedIdToken = idToken;
        if (onAuthSuccess) {
          onAuthSuccess(user, cachedAccessToken, idToken);
        }
      } catch {
        cachedAccessToken = null;
        cachedIdToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      cachedIdToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
  idToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Workspace.');
    }

    const idToken = await result.user.getIdToken();
    cachedAccessToken = credential.accessToken;
    cachedIdToken = idToken;

    return {
      user: result.user,
      accessToken: cachedAccessToken,
      idToken: cachedIdToken,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailPasswordSignIn = async (email: string, pass: string): Promise<User> => {
  try {
    isSigningIn = true;
    const res = await signInWithEmailAndPassword(auth, email, pass);
    cachedIdToken = await res.user.getIdToken();
    return res.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const emailPasswordSignUp = async (email: string, pass: string): Promise<User> => {
  try {
    isSigningIn = true;
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    cachedIdToken = await res.user.getIdToken();
    return res.user;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const getBackendAuthToken = async (): Promise<string> => {
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      cachedIdToken = idToken;
      return idToken;
    } catch {
      // fallback
    }
  }
  return cachedIdToken || 'vn-operator-session-token';
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  cachedIdToken = null;
};
