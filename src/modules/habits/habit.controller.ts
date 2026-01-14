import { Request, Response, NextFunction } from "express";
import {
    createHabit,
    getHabitsByUserId,
    getHabitById,
    deleteHabitById,
    updateHabitById,
    getListOfHabits,
    addHabitLog,
    getHabitsByDate,
    updateHabitLogProgress
} from "./habit.service";
import { responseHandler } from "../../middlewares/responseHandler";
import { IHabit } from "./habit.model";

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
        const {
            title,
            category,
            iconUrl,
            color,

            repeatType,
            repeatDaysOfWeek,
            repeatDaysOfMonth,
            repeatMonthsOfYear,

            goalValue,
            goalUnit,

            remindersEnabled,
            reminderTimes,
        } = req.body;

        const files = req.files as any;
        const images = Array.isArray(files) ? files.map((file: any) => file.location) : [];
        const habitData: Partial<IHabit> = {
            title,
            category,
            iconUrl,
            color,
            images,

            repeat: {
                type: repeatType,
                daysOfWeek: repeatDaysOfWeek,
                daysOfMonth: repeatDaysOfMonth?.map(Number),
                monthsOfYear: repeatMonthsOfYear?.map(Number),
            },

            goal: {
                value: Number(goalValue),
                unit: goalUnit,
            },

            reminders: {
                enabled: remindersEnabled === "true",
                times: reminderTimes,
            },
        };

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
        const { category } = req.query;
        const categoryString = typeof category === "string" ? category : undefined;

        const habits = await getHabitsByUserId(userId, categoryString);
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
        const { habitId } = req.params;

        const {
            title,
            category,
            iconUrl,
            color,

            repeatType,
            repeatDaysOfWeek,
            repeatDaysOfMonth,
            repeatMonthsOfYear,

            goalValue,
            goalUnit,

            remindersEnabled,
            reminderTimes,

            isActive,
        } = req.body;

        const files = req.files as any;
        const images = Array.isArray(files) ? files.map((file: any) => file.location) : undefined;

        // Build update object with only provided fields
        const habitData: Partial<IHabit> = {};

        if (title !== undefined) habitData.title = title;
        if (category !== undefined) habitData.category = category;
        if (iconUrl !== undefined) habitData.iconUrl = iconUrl;
        if (color !== undefined) habitData.color = color;
        if (images !== undefined) habitData.images = images;
        if (isActive !== undefined) habitData.isActive = isActive;

        // Handle repeat settings
        if (repeatType !== undefined || repeatDaysOfWeek !== undefined || 
            repeatDaysOfMonth !== undefined || repeatMonthsOfYear !== undefined) {
            habitData.repeat = {
                type: repeatType,
                daysOfWeek: repeatDaysOfWeek,
                daysOfMonth: repeatDaysOfMonth?.map(Number),
                monthsOfYear: repeatMonthsOfYear?.map(Number),
            };
        }

        // Handle goal settings
        if (goalValue !== undefined || goalUnit !== undefined) {
            habitData.goal = {
                value: goalValue !== undefined ? Number(goalValue) : undefined as any,
                unit: goalUnit,
            } as any;
        }

        // Handle reminders
        if (remindersEnabled !== undefined || reminderTimes !== undefined) {
            habitData.reminders = {
                enabled: remindersEnabled === "true" || remindersEnabled === true,
                times: reminderTimes,
            } as any;
        }

        const habit = await updateHabitById(userId, habitId, habitData);
        
        if (!habit) {
            return responseHandler(res, null, 404, "Habit not found");
        }

        return responseHandler(res, habit, 200, "Habit updated successfully");
    } catch (error) {
        next(error);
    }
};

export const getListOfHabitsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const habitsList = await getListOfHabits();
        return responseHandler(res, habitsList, 200, "List of habits retrieved successfully");
    }
    catch (error) {
        next(error);
    }
}

export const addHabitLogController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;

        await addHabitLog(userId);
        return responseHandler(res, null, 200, "Habit logs added/updated successfully");
    }
    catch (error) {
        next(error);
    }
}

export const getHabitsByDateController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const { date } = req.query;
        if (typeof date !== "string") {
            throw new Error("Date query parameter is required and must be a string");
        }
        const habits = await getHabitsByDate(userId, date);
        return responseHandler(res, habits, 200, "Habits for the specified date retrieved successfully");
    }
    catch (error) {
        next(error);
    }
}

export const updateHabitLogProgressController = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const userId = req.user.id;
        const { habitId } = req.params;
        const { date, progress } = req.body;
        if (!date || !habitId || progress === undefined) {
            throw new Error("date, habitId, and progress are required in the request body");
        }
        await updateHabitLogProgress(userId, habitId, date, Number(progress));
        return responseHandler(res, null, 200, "Habit log progress updated successfully");
    }
    catch (error) {
        next(error);
    }
}