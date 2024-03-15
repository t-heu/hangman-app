import * as firebase from 'firebase/app';
import { getDatabase, ref, set, onValue, update, get, child } from "firebase/database";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};

const app = firebase.initializeApp(firebaseConfig);
const database = getDatabase(app);

export { firebase, database, ref, set, onValue, update, get, child };