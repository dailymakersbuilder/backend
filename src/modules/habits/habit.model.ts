import mongoose, { HydratedDocument, Schema } from 'mongoose';

export interface IHabit {
    userId: mongoose.Types.ObjectId;
    title: string;
    category: string;
    description?: string;
    iconUrl?: string;
    color?: string;
    images?: string[];
    repeat: boolean;
    repeatType?: string;
    repeatDays?: string[];
    goal: number;
    reminderTimes: string[];
}

export type HabitDocument = HydratedDocument<IHabit>;

const HabitSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true, 
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        iconUrl: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            trim: true,
        },
        images: [{
            type: String,
            trim: true,
        }],
        repeat: {
            type: Boolean,
            required: true,
            default: false,
        },
        repeatType: {
            type: String,
            trim: true,
        },
        repeatDays: [{
            type: String,
            trim: true,
        }],
        goal: {
            type: Number,
            required: true,
            default: 1,
        },
        reminderTimes: [{
            type: String,
            trim: true,
        }],
    },
    { timestamps: true }
);

export default mongoose.model<HabitDocument>("Habit", HabitSchema);