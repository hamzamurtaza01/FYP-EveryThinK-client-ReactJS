import firebase from 'firebase/app';
// import firebase from './index';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

//HAMZA ka firebase
const config = {
    apiKey: "AIzaSyCAxfCotk8Bn074eZye-KDxyScD7gRFofw",
    authDomain: "everythink-1.firebaseapp.com",
    databaseURL: "https://everythink-1.firebaseio.com",
    projectId: "everythink-1",
    storageBucket: "everythink-1.appspot.com",
    messagingSenderId: "551423560687"
  };

// const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

const db = firebase.database();
const auth = firebase.auth();
export { db, auth };
export default firebase;