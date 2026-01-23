import { IHabit } from "./habit.model";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

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


export const dateToWeekDay = (date: string) => {
    const day = dayjs(date).isoWeekday(); // 1 = Monday, 7 = Sunday
    const map: Record<number, string> = {
        1: "MON",
        2: "TUE",
        3: "WED",
        4: "THU",
        5: "FRI",
        6: "SAT",
        7: "SUN",
    };
    return map[day];
};
