import cron from "node-cron";
import Habit from "../habits/habit.model";
import User from "../user/user.model";
import { sendPush } from "./notification.handler";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

cron.schedule("* * * * *", async () => {
    console.log("Cron is running")
    const now = new Date();

    const currentTime = now.toTimeString().slice(0, 5); // HH:mm
    const todayDate = now.toISOString().slice(0, 10);  // YYYY-MM-DD
    const todayDay = DAYS[now.getDay()];                // MON, TUE...
    const todayDayOfMonth = now.getDate();              // 1–31
    const currentMonth = now.getMonth() + 1;            // 1–12

    const habits = await Habit.find({
        isActive: true,
        "reminders.enabled": true,
        $or: [
            { "reminders.times": currentTime },
            { reminderLastTime: currentTime }
        ],
    });

    for (const habit of habits) {
        if (habit.reminderLastTime === currentTime) {
            continue;
        }

        const repeat = habit.repeat;

        let shouldSend = false;

        switch (repeat.type) {
            case "EVERY_DAY":
                shouldSend = true;
                break;

            case "WEEKLY":
                shouldSend = repeat.daysOfWeek?.includes(todayDay) ?? false;
                break;

            case "MONTHLY":
                shouldSend = repeat.daysOfMonth?.includes(todayDayOfMonth) ?? false;
                break;

            case "YEARLY":
                shouldSend = repeat.monthsOfYear?.includes(currentMonth) ?? false;
                break;
        }

        if (!shouldSend) continue;

        const user = await User.findById(habit.userId).select("msgToken");
        if (!user?.msgToken) continue;

        await sendPush(
            user.msgToken,
            "Habit Reminder",
            `Time for ${habit.title}`,
            { habitId: habit._id.toString() }
        );

        await habit.save();
    }
});