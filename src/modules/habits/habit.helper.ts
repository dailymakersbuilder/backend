import { IHabit } from "./habit.model";

export function isHabitForToday(habit: IHabit, today = new Date()) {
    const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][today.getDay()];
    const date = today.getDate();
    const month = today.getMonth() + 1;

    switch (habit.repeat.type) {
        case "EVERY_DAY":
            return true;

        case "WEEKLY":
            return habit.repeat.daysOfWeek?.includes(day);

        case "MONTHLY":
            return habit.repeat.daysOfMonth?.includes(date);

        case "YEARLY":
            return habit.repeat.monthsOfYear?.includes(month);

        default:
            return false;
    }
}

export function calculateProgress(progress: number, goal: number) {
    return Math.min(100, Math.round((progress / goal) * 100));
}

