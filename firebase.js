import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
const firebaseConfig = {
  apiKey: "AIzaSyC8oAKKtcRESKkqq_wH30hpsRt4mndlgW0",
  authDomain: "flexi-4d473.firebaseapp.com",
  projectId: "flexi-4d473",
  storageBucket: "flexi-4d473.appspot.com",
  messagingSenderId: "1029368235596",
  appId: "1:1029368235596:web:83d0f793511a7e7ec3d6e9",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
