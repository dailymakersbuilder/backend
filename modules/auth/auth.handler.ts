import { auth } from "../../config/firebase";
import jwt from "jsonwebtoken";

export const generateJwtToken = (payload: object) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return token;
}

export const verifyFirebaseToken = async(idToken: string) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid Firebase token');
    }
}

export const getFirebaseUser = async(uid: string) => {
    try {
        const userRecord = await auth.getUser(uid);
        return userRecord;
    } catch (error) {
        throw new Error('Failed to get Firebase user');
    }
};

export const generateOTP = (): string => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}