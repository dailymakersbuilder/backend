import admin from 'firebase-admin';

if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
} else {
    throw new Error('Firebase credentials not configured');
}
export const auth = admin.auth();
export default admin;