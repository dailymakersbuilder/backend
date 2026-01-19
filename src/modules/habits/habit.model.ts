import mongoose, { HydratedDocument, Schema } from 'mongoose';

export type RepeatType =
    | "EVERY_DAY"
    | "WEEKLY"
    | "MONTHLY"
    | "YEARLY";

export type GoalUnit = "MINUTES" | "HOURS";

export interface IHabit {
    userId: mongoose.Types.ObjectId;

    title: string;
    category: string;

    iconUrl?: string;
    color?: string;
    images?: string[];

    repeat: {
        type: RepeatType;
        // For WEEKLY → ["MON", "WED", "FRI"]
        daysOfWeek?: string[];
        // For MONTHLY → [1, 15, 30]
        daysOfMonth?: number[];
        // For YEARLY → [1, 6, 12]
        monthsOfYear?: number[];
    };

    goal: {
        value: number;
        unit: GoalUnit;
    };

    reminders: {
        times: string[];
        enabled: boolean;
    };
    isActive: boolean;
    reminderLastTime?: string;
}


export type HabitDocument = HydratedDocument<IHabit>;

const HabitSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
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
            index: true,
        },

        iconUrl: String,
        color: String,

        images: [{ type: String }],

        repeat: {
            type: {
                type: String,
                enum: ["EVERY_DAY", "WEEKLY", "MONTHLY", "YEARLY"],
                required: true,
                default: "EVERY_DAY",
            },

            daysOfWeek: [
                {
                    type: String,
                    enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
                },
            ],

            daysOfMonth: [
                {
                    type: Number,
                    min: 1,
                    max: 31,
                },
            ],

            monthsOfYear: [
                {
                    type: Number,
                    min: 1,
                    max: 12,
                },
            ],
        },

        goal: {
            value: {
                type: Number,
                required: true,
                min: 1,
            },
            unit: {
                type: String,
                enum: ["MINUTES", "HOURS"],
                required: true,
            },
        },

        reminders: {
            enabled: {
                type: Boolean,
                default: true,
            },
            times: [
                {
                    type: String, // HH:mm
                    match: /^([01]\d|2[0-3]):([0-5]\d)$/,
                },
            ],
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        reminderLastTime: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model<HabitDocument>("Habit", HabitSchema);