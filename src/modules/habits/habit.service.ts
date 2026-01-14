import Habit from "./habit.model";
import { IHabit } from "./habit.model";
import User from "../user/user.model";
import mongoose from "mongoose";
import { CRAFTING_AND_ARTS_HOBBIES } from "./constants";
import { isHabitForToday, calculateProgress } from "./habit.helper";
import HabitLog, { IHabitLog } from "./habitlog.model";

export const createHabit = async (
    userId: string,
    habitData: Partial<IHabit>,
): Promise<IHabit> => {

    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const habitDataWithUserId = {
        userId: user._id,
        ...habitData,
    }

    const habit = await Habit.create(habitDataWithUserId);
    if (!habit) {
        throw new Error("Failed to create habit");
    }
    return habit;
};

export const getHabitsByUserId = async (
    userId: string,
    category?: string,
): Promise<IHabit[]> => {
    const query: any = {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
    };

    if (category) {
        query.category = { $regex: `^${category}$`, $options: "i" };
    }
    const habits = await Habit.find(query);
    if (!habits) {
        throw new Error("No habits found for this user");
    }
    return habits;
}

export const getHabitById = async (
    habitId: string,
    userId: string
): Promise<IHabit | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found");
    }
    return habit;
}

export const deleteHabitById = async (
    habitId: string,
    userId: string
): Promise<void> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found or you do not have permission to delete it");
    }
    await Habit.deleteOne({ _id: new mongoose.Types.ObjectId(habitId) });
}

export const updateHabitById = async (
    userId: string,
    habitId: string,
    habitData: Partial<IHabit>
): Promise<IHabit | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found or you do not have permission to update it");
    }
    const updatedHabit = await Habit.findByIdAndUpdate(habitId, habitData, { new: true });
    return updatedHabit;
}

export const getListOfHabits = async (): Promise<typeof CRAFTING_AND_ARTS_HOBBIES> => {
    return CRAFTING_AND_ARTS_HOBBIES;
}

export const addHabitLog = async (
    userId: string,
): Promise<void> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const habits = await Habit.find({
        userId: userObjectId,
        isActive: true,
    });

    if (!habits.length) return;

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const bulkOps = [];
    console.log("Habits to process for logs:", habits.length);

    for (const habit of habits) {
        console.log("Processing habit:", habit._id.toString());
        console.log("Is habit for today?", isHabitForToday(habit, today));
        if (!isHabitForToday(habit, today)) continue;

        bulkOps.push({
            updateOne: {
                filter: {
                    habitId: habit._id,
                    date: todayStr,
                },
                update: {
                    $setOnInsert: {
                        habitId: habit._id,
                        userId: userObjectId,
                        date: todayStr,
                        progressValue: 0,
                        goalValue: habit.goal.value,
                        completed: false,
                    },
                },
                upsert: true,
            },
        });
    }
    console.log("Bulk operations to perform:", bulkOps.length);

    if (bulkOps.length > 0) {
        await HabitLog.bulkWrite(bulkOps);
    }
};

async function calculateStreak(
    habitId: string,
    habit: any,
    uptoDate: Date
): Promise<number> {
    let streak = 0;
    let cursor = new Date(uptoDate);

    while (true) {
        if (!isHabitForToday(habit, cursor)) {
            cursor.setDate(cursor.getDate() - 1);
            continue;
        }

        const dateStr = cursor.toISOString().slice(0, 10);

        const log = await HabitLog.findOne({
            habitId,
            date: dateStr,
            completed: true,
        });

        if (!log) break;

        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

export const getHabitsByDate = async (
    userId: string,
    dateStr: string
) => {
    const date = new Date(dateStr);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await addHabitLog(userId);

    const habits = await Habit.find({
        userId: userObjectId,
        isActive: true,
    });

    const habitIds = habits.map(h => h._id);

    const logs = await HabitLog.find({
        userId: userObjectId,
        date: dateStr,
        habitId: { $in: habitIds },
    });

    const logMap = new Map(
        logs.map(l => [l.habitId.toString(), l])
    );

    const completed = [];
    const pending = [];
    const streaks: { [key: string]: number } = {};

    for (const habit of habits) {
        if (!isHabitForToday(habit, date)) continue;

        const log = logMap.get(habit._id.toString());

        const progress = log?.progressValue ?? 0;
        const goal = log?.goalValue ?? habit.goal.value;

        const status = {
            habitId: habit._id,
            title: habit.title,
            category: habit.category,
            goal: habit.goal,
            progressValue: progress,
            progressPercent: calculateProgress(progress, goal),
            completed: log?.completed ?? false,
        };

        if (status.completed) completed.push(status);
        else pending.push(status);

        streaks[habit._id.toString()] = await calculateStreak(
            habit._id.toString(),
            habit,
            date
        );
    }

    return {
        date: dateStr,
        completed,
        pending,
        streaks,
    };
};

export const updateHabitLogProgress = async (
    userId: string,
    habitId: string,
    dateStr: string,
    progressValue: number
): Promise<IHabitLog | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found or you do not have permission to update its log");
    }
    const habitLog = await HabitLog.findOne({ habitId: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId), date: dateStr });
    if (!habitLog) {
        throw new Error("Habit log not found for the specified date");
    }
    const updatedProgressValue = Math.min(progressValue, habitLog.goalValue);
    const percentageCompleted = calculateProgress(updatedProgressValue, habitLog.goalValue);
    const completed = percentageCompleted >= 100;
    habitLog.progressValue = updatedProgressValue;
    habitLog.percentageCompleted = percentageCompleted;
    habitLog.completed = completed;
    await habitLog.save();
    return habitLog;
}