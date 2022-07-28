import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyC9bvAgc0nJvwGgJF0dgVpkhHR5hxhmVGw',
	authDomain: 'video-project-fbdef.firebaseapp.com',
	projectId: 'video-project-fbdef',
	storageBucket: 'video-project-fbdef.appspot.com',
	messagingSenderId: '1098528406575',
	appId: '1:1098528406575:web:f0d2a41aaf5c1e2c775ada',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(app);
export { db, storage };
