import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import admin from 'firebase-admin';
import serviceAccount from './path-to-your-service-account.json';


admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});

const firebaseConfig = {

   apikey: process.env.API_KEY,
   appId: process.env.APP_ID,
   projectId: process.env.PROJECT_ID,
   storageBucket: process.env.STORAGE_BUCKET,
   messagingSenderId: process.env.MESSAGE_SENDER_ID,
   measurementId: process.env.MEASUREMENT_ID

};

const App = initializeApp(firebaseConfig);
export const auth = getAuth(App);

module.exports = admin;