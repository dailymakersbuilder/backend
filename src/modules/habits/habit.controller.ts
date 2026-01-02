import { Request, Response, NextFunction } from "express";
import {
    createHabit,
    getHabitsByUserId,
    getHabitById,
    deleteHabitById,
    updateHabitById
} from "./habit.service";
import { responseHandler } from "../../middlewares/responseHandler";

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const createHabitController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const habitData = req.body;

        const files = req.files as any;
        const images = Array.isArray(files) ? files.map((file: any) => file.location) : [];
        habitData.images = images;

        const habit = await createHabit(userId, habitData);
        return responseHandler(res, habit, 201, "Habit created successfully");
    }
    catch (error) {
        next(error);
    }
}

export const getHabitsController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const habits = await getHabitsByUserId(userId);
        return responseHandler(res, habits, 200, "Habits retrieved successfully");
    }
    catch (error) {
        next(error);
    }
}

export const getHabitByIdController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const habitId = req.params.habitId;
        const habit = await getHabitById(habitId, userId);
        return responseHandler(res, habit, 200, "Habit retrieved successfully");
    }
    catch (error) {
        next(error);
    }
}

export const deleteHabitController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const habitId = req.params.habitId;

        await deleteHabitById(habitId, userId);
        return responseHandler(res, null, 200, "Habit deleted successfully");
    }
    catch (error) {
        next(error);
    }
}

export const updateHabitController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const habitId = req.params.habitId;
        const updateData = req.body;

        const files = req.files as any;
        const images = Array.isArray(files) ? files.map((file: any) => file.location) : [];
        updateData.images = images;

        const updatedHabit = await updateHabitById(habitId, userId, updateData);
        return responseHandler(res, updatedHabit, 200, "Habit updated successfully");
    }
    catch (error) {
        next(error);
    }
}