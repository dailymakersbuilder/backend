import Habit from "./habit.model";
import { IHabit } from "./habit.model";
import User from "../user/user.model";
import mongoose from "mongoose";

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
    userId: string
): Promise<IHabit[]> => {
    const habits = await Habit.find({ userId: new mongoose.Types.ObjectId(userId) });
    if(!habits) {
        throw new Error("No habits found for this user");
    }
    return habits;
}

export const getHabitById = async (
    habitId: string,
    userId: string
): Promise<IHabit | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if(!habit) {
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
    habitId: string,
    userId: string,
    updateData: Partial<IHabit>
): Promise<IHabit | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found or you do not have permission to update it");
    }
    const updatedHabit = await Habit.findByIdAndUpdate(habitId, updateData, { new: true });
    return updatedHabit;
}