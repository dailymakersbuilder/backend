import { Request, Response, NextFunction } from "express";
import { responseHandler } from "../../middlewares/responseHandler";
import {
    findByUserId,
    updateUser,
    updatePreferences,
    softDeleteUser
} from "./user.service";

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const findByUserIdController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const user = await findByUserId(userId);
        return responseHandler(res, user, 200, "User fetched successfully");
    } catch (error) {
        next(error);
    }
};

export const updateUserController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }

        const userId = req.user.id;
        const updateData = req.body;

        if (req.file) {
            updateData.avatarUrl = (req.file as any).location;
        }
        const updatedUser = await updateUser(userId, updateData);
        return responseHandler(res, updatedUser, 200, "User updated successfully");
    } catch (error) {
        next(error);
    }
}

export const updatePreferencesController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const preferences = req.body.preferences;
        const updatedUser = await updatePreferences(userId, preferences);
        return responseHandler(res, updatedUser, 200, "Preferences updated successfully");
    }
    catch (error) {
        next(error);
    }
}

export const deleteUserController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        await softDeleteUser(userId);
        return responseHandler(res, null, 200, "User deleted successfully");
    }
    catch (error) {
        next(error);
    }
}