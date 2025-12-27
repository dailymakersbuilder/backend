import e, { Request, Response, NextFunction } from "express";
import { responseHandler } from "../../middlewares/responseHandler";
import { verifyFirebaseToken, getFirebaseUser } from "./auth.handler";
import {
    registerUser,
    loginUser,
    findOrCreateFirebaseUser
} from "./auth.service";

export const registerController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fullName, email, password, device, msgToken } = req.body;
        if (!fullName || !email || !password || !device || !msgToken) {
            throw new Error("Missing required fields");
        }
        const user = await registerUser(fullName, email, password, device, msgToken);
        responseHandler(res, user, 201, "User registered successfully");
    } catch (error) {
        next(error);
    }
}

export const loginController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new Error("Missing required fields");
        }
        const user = await loginUser(email, password);
        responseHandler(res, user, 200, "User logged in successfully");
    } catch (error) {
        next(error);
    }
};

export const findOrCreateFirebaseUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { idToken, msgToken } = req.body;
        if (!idToken || !msgToken) {
            throw new Error("Missing id Token or msgToken");
        }
        const decodedToken = await verifyFirebaseToken(idToken);

        const firebaseUser = await getFirebaseUser(decodedToken.uid);

        const user = await findOrCreateFirebaseUser(firebaseUser, msgToken);

        responseHandler(res, user, 200, "Firebase user authenticated successfully");
    } catch (error) {
        next(error);
    }
};
