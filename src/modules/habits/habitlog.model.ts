import mongoose, { Schema, HydratedDocument } from "mongoose";

export interface IHabitLog {
    habitId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;

    date: string;

    progressValue: number;
    goalValue: number;
    percentageCompleted: number;

    completed: boolean;
    skipped?: boolean;
    failed?: boolean;
}

export type HabitLogDocument = HydratedDocument<IHabitLog>;

const HabitLogSchema = new Schema(
    {
        habitId: {
            type: Schema.Types.ObjectId,
            ref: "Habit",
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        date: {
            type: String, // "2026-01-14"
            required: true,
            index: true,
        },

        progressValue: {
            type: Number,
            default: 0,
            min: 0,
        },

        goalValue: {
            type: Number,
            required: true,
        },

        percentageCompleted: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        completed: {
            type: Boolean,
            default: false,
        },
        skipped: {
            type: Boolean,
            default: false,
        },
        failed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

HabitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.model<HabitLogDocument>("HabitLog", HabitLogSchema);
