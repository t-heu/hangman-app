import * as firebase from 'firebase/app';
import {
  child,
  equalTo,
  get,
  getDatabase,
  off,
  onChildAdded,
  onChildChanged,
  onDisconnect,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
};

// 🔥 Inicializa o app
const app = firebase.initializeApp(firebaseConfig);

// 📦 Realtime Database
const database = getDatabase(app);

export {
  child, database, equalTo, firebase, get, off, onChildAdded, onChildChanged, onDisconnect, onValue, orderByChild, push,
  query, ref, remove, set, update
};
