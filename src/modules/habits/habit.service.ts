import Habit from "./habit.model";
import { IHabit, type GoalUnit } from "./habit.model";
import User from "../user/user.model";
import mongoose from "mongoose";
import { CRAFTING_AND_ARTS_CATEGORIES } from "./constants";
import { isHabitForToday, calculateProgress, dateToWeekDay } from "./habit.helper";
import HabitLog, { IHabitLog } from "./habitlog.model";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { ReportResult } from "./habit.types";

export interface IHabitWithPopularity extends IHabit {
    title: string;
    category: string;
    color?: string;
    peopleCount: number;
    averageTime: number;
    unit: GoalUnit;
}

dayjs.extend(isoWeek);

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
    search?: string,
    category?: string,
    from?: string,
    to?: string,
    sortBy?: "createdAt" | "updatedAt" | "title"
): Promise<IHabit[]> => {
    const query: any = {
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
    };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
        ];
    }
    if (category) {
        query.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
    }
    const sortField = sortBy || "createdAt";

    const habits = await Habit.find(query).sort({ [sortField]: -1 });
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

export const getListOfHabits = async (): Promise<
    Record<string, { title: string; iconUrl: string }[]>
> => {
    const result: Record<string, { title: string; iconUrl: string }[]> = {};

    for (const category of CRAFTING_AND_ARTS_CATEGORIES) {
        result[category.title] = category.habits.map(habit => ({
            title: habit.title,
            iconUrl: habit.iconUrl,
        }));
    }

    return result;
};


export const addHabitLog = async (
    userId: string,
    date: string // expected format: YYYY-MM-DD
): Promise<void> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const habits = await Habit.find({
        userId: userObjectId,
        isActive: true,
    });

    if (!habits.length) return;

    const bulkOps = [];

    for (const habit of habits) {
        // check if habit should run on this date
        if (!isHabitForToday(habit, new Date(date))) continue;

        bulkOps.push({
            updateOne: {
                filter: {
                    userId: userObjectId,
                    habitId: habit._id,
                    date: date,
                },
                update: {
                    $setOnInsert: {
                        userId: userObjectId,
                        habitId: habit._id,
                        date: date,
                        progressValue: 0,
                        goalValue: habit.goal.value,
                        completed: false,
                        failed: false,
                        percentageCompleted: 0,
                    },
                },
                upsert: true,
            },
        });
    }

    if (bulkOps.length) {
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
    await addHabitLog(userId, dateStr);

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

export const updateSkippedFailedStatus = async (
    userId: string,
    habitId: string,
    dateStr: string,
    skipped: boolean,
    failed: boolean
): Promise<IHabitLog | null> => {
    const habit = await Habit.findOne({ _id: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId) });
    if (!habit) {
        throw new Error("Habit not found or you do not have permission to update its log");
    }
    const habitLog = await HabitLog.findOne({ habitId: new mongoose.Types.ObjectId(habitId), userId: new mongoose.Types.ObjectId(userId), date: dateStr });
    if (!habitLog) {
        throw new Error("Habit log not found for the specified date");
    }
    habitLog.skipped = skipped;
    habitLog.failed = failed;
    await habitLog.save();
    return habitLog;
}

export const getDiscoverHabits = async (
    userId: string,
    category?: string,
    trendingOnly: boolean = false
) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const habitIconMap = new Map<string, string>();
    for (const c of CRAFTING_AND_ARTS_CATEGORIES) {
        for (const h of c.habits) {
            habitIconMap.set(h.title.toLowerCase(), h.iconUrl);
        }
    }

    /* -------------------- TRENDING DATA -------------------- */
    let trending = await HabitLog.aggregate([
        { $match: { userId: userObjectId } },
        {
            $group: {
                _id: "$habitTitle",
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
        {
            $project: {
                _id: 0,
                title: "$_id",
            },
        },
    ]);

    const trendingTitles = new Set(trending.map(h => h?.title?.toLowerCase()));


    if (trending.length < 20) {
        const allConstantHabits = CRAFTING_AND_ARTS_CATEGORIES.flatMap(c =>
            c.habits.map(h => h.title)
        ).filter(h => !trendingTitles.has(h?.toLowerCase()));

        const shuffled = allConstantHabits.sort(() => Math.random() - 0.5);

        const needed = 20 - trending.length;
        const filler = shuffled.slice(0, needed);

        trending = [
            ...trending.map(h => ({ title: h.title })),
            ...filler.map(title => ({ title })),
        ];
    }

    /* -------------------- 1️⃣ TRENDING ONLY -------------------- */
    if (trendingOnly) {
        return {
            type: "TRENDING",
            habits: trending.map(h => ({
                title: h.title,
                iconUrl: habitIconMap.get(h?.title?.toLowerCase()) || null,
            })),
        };
    }

    /* -------------------- 2️⃣ CATEGORY ONLY -------------------- */
    if (category) {
        const matchedCategory = CRAFTING_AND_ARTS_CATEGORIES.find(
            c => c.title.toLowerCase() === category.toLowerCase()
        );

        return {
            type: "CATEGORY",
            category,
            habits: matchedCategory
                ? matchedCategory.habits.map(h => ({
                    title: h.title,
                    iconUrl: h.iconUrl,
                }))
                : [],
        };
    }

    /* -------------------- 3️⃣ ONLY TAGS -------------------- */
    return {
        type: "TAGS",
        tags: [
            "Trending",
            ...CRAFTING_AND_ARTS_CATEGORIES.map(c => c.title),
        ],
    };
};



export const generateHabitReport = async (
    userId: string,
    reportType: "daily" | "weekly" | "monthly",
    startDate?: string, // "YYYY-MM-DD"
    endDate?: string
): Promise<ReportResult> => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    /* -------------------- 1️⃣ DEFAULT DATE RANGES -------------------- */
    const today = dayjs().format("YYYY-MM-DD");

    // Daily
    const dailyStart = startDate || today;
    const dailyEnd = endDate || today;

    // Weekly (current ISO week: Monday → Sunday)
    const monday = startDate || dayjs().startOf("isoWeek").format("YYYY-MM-DD");
    const sunday = endDate || dayjs().endOf("isoWeek").format("YYYY-MM-DD");

    console.log("Weekly range:", monday, "to", sunday);

    // Monthly (current month)
    const monthStart = startDate || dayjs().startOf("month").format("YYYY-MM-DD");
    const monthEnd = endDate || dayjs().endOf("month").format("YYYY-MM-DD");

    console.log("Monthly range:", monthStart, "to", monthEnd);

    /* -------------------- 2️⃣ FETCH HABIT LOGS -------------------- */
    const allHabits = await Habit.find({ userId: userObjectId, isActive: true });

    let dailyLogs: IHabitLog[] = [];
    let weeklyLogs: IHabitLog[] = [];
    let monthlyLogs: IHabitLog[] = [];
    if (reportType === "daily") {
        dailyLogs = await HabitLog.find({
            userId: userObjectId,
            date: { $gte: dailyStart, $lte: dailyEnd }
        });
    } else if (reportType === "weekly") {

        weeklyLogs = await HabitLog.find({
            userId: userObjectId,
            date: { $gte: monday, $lte: sunday }
        });
    } else if (reportType === "monthly") {
        monthlyLogs = await HabitLog.find({
            userId: userObjectId,
            date: { $gte: monthStart, $lte: monthEnd }
        });
    }


    /* -------------------- 3️⃣ HELPER FUNCTION -------------------- */
    const computeStats = (logs: typeof dailyLogs) => {
        const total = logs.length;
        const completed = logs.filter(l => l.completed).length;
        const skipped = logs.filter(l => l.skipped).length;
        const failed = logs.filter(l => l.failed).length;

        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, skipped, failed, successRate };
    };

    /* -------------------- 4️⃣ WEEKLY STREAK (CURRENT WEEK ONLY) -------------------- */
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const weeklyStreak: Record<string, boolean> = {};
    const currentWeekStart = dayjs().startOf("isoWeek").format("YYYY-MM-DD"); // Monday
    const currentWeekEnd = dayjs().endOf("isoWeek").format("YYYY-MM-DD");     // Sunday
    const currentWeekLogs = await HabitLog.find({
        userId: userObjectId,
        date: { $gte: currentWeekStart, $lte: currentWeekEnd }
    });

    for (let i = 0; i < 7; i++) {
        const date = dayjs().startOf("isoWeek").add(i, "day").format("YYYY-MM-DD");

        const habitsToDoToday = allHabits.filter(habit => {
            const repeat = habit.repeat;
            const dayOfWeek = dateToWeekDay(date);
            const dayOfMonth = Number(dayjs(date).format("D"));
            const month = Number(dayjs(date).format("M"));

            if (repeat.type === "EVERY_DAY") return true;
            if (repeat.type === "WEEKLY" && repeat.daysOfWeek?.includes(dayOfWeek)) return true;
            if (repeat.type === "MONTHLY" && repeat.daysOfMonth?.includes(dayOfMonth)) return true;
            if (repeat.type === "YEARLY" && repeat.monthsOfYear?.includes(month)) return true;

            return false;
        });

        // If no habits today → true (don’t break streak)
        if (habitsToDoToday.length === 0) {
            weeklyStreak[weekDays[i]] = true;
            continue;
        }

        const completedToday = habitsToDoToday.every(habit =>
            currentWeekLogs.some(
                log =>
                    log.habitId.toString() === habit._id.toString() &&
                    log.date === date &&
                    log.completed
            )
        );

        weeklyStreak[weekDays[i]] = completedToday;
    }


    /* -------------------- 5️⃣ RETURN REPORT -------------------- */
    const returnData: Record<string, any> = {};
    if (reportType === "daily") {
        returnData['startDate'] = dailyStart;
        returnData['endDate'] = dailyEnd;
        returnData['daily'] = computeStats(dailyLogs);
        returnData['weeklyStreak'] = weeklyStreak;

    }
    if (reportType === "weekly") {
        returnData['startDate'] = monday;
        returnData['endDate'] = sunday;
        returnData['weekly'] = computeStats(weeklyLogs);
        returnData['weeklyStreak'] = weeklyStreak;
    }
    if (reportType === "monthly") {
        returnData['startDate'] = monthStart;
        returnData['endDate'] = monthEnd;
        returnData['monthly'] = computeStats(monthlyLogs);
        returnData['weeklyStreak'] = weeklyStreak;

    }

    return returnData;
};

export const getRecommendedHabits = async (
    userId: string,
    limit: number = 20
) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1️⃣ Get user preferences
    const user = await User.findById(userObjectId).select("preferences").lean();
    if (!user?.preferences) {
        throw new Error("User preferences not found");
    }

    const preferredHabits = Object.keys(user.preferences).filter(
        key => (user.preferences as any)[key] === true
    );

    // 2️⃣ Get all active habits to exclude
    const activeHabits = await Habit.find({
        userId: userObjectId,
        isActive: true,
    }).select("title category iconUrl color").lean();

    const activeTitles = new Set(activeHabits.map(h => h?.title?.toLowerCase()));

    // 3️⃣ Get all habits from DB grouped by category
    const allHabits = await Habit.find({}).lean();

    // 4️⃣ Determine categories of preferred habits
    const preferredCategories = new Set<string>();
    for (const habit of allHabits) {
        if (preferredHabits.includes(habit.title)) {
            preferredCategories.add(habit.category);
        }
    }

    // 5️⃣ Collect recommendations from preferred categories, excluding active habits
    type RecommendedHabit = {
        title: string;
        iconUrl: string;
        color: string;
    };
    const recommended: RecommendedHabit[] = [];

    for (const habit of allHabits) {
        if (!preferredCategories.has(habit.category)) continue;
        if (activeTitles.has(habit?.title?.toLowerCase())) continue;
        if (recommended.some(r => r.title === habit.title)) continue;
        recommended.push({
            title: habit.title,
            iconUrl: habit.iconUrl ?? "",
            color: habit.color ?? ""
        });

        if (recommended.length >= limit) break;
    }

    // 6️⃣ Fallback: if no preference matches, pick any non-active habits
    if (recommended.length === 0) {
        for (const habit of allHabits) {
            if (activeTitles.has(habit?.title?.toLowerCase())) continue;
            if (recommended.some(r => r.title === habit.title)) continue;

            recommended.push({
            title: habit.title,
            iconUrl: habit.iconUrl ?? "",
            color: habit.color ?? ""
        });
            if (recommended.length >= limit) break;
        }
    }

    return recommended.slice(0, limit);
};

export const getHabitsWithPopularity = async (
    sortBy: "createdAt" | "updatedAt" | "title",
    search?: string,
    category?: string,
    from?: string,
    to?: string,
): Promise<IHabitWithPopularity[]> => {
    const matchStage: any = {
        isActive: true,
    };

    if (search) {
        matchStage.$or = [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
        ];
    }
    if (category) {
        matchStage.category = category;
    }

    if (from || to) {
        matchStage.createdAt = {};
        if (from) matchStage.createdAt.$gte = new Date(from);
        if (to) matchStage.createdAt.$lte = new Date(to);
    }

    const habits = await Habit.aggregate([
        { $match: matchStage },

        /* ---------- Group by habit identity ---------- */
        {
            $group: {
                _id: {
                    title: "$title",
                    category: "$category",
                },
                color: { $first: "$color" },
                users: { $addToSet: "$userId" },
                avgGoalValue: { $avg: "$goal.value" },
                goalUnit: { $first: "$goal.unit" },
                createdAt: { $min: "$createdAt" },
                updatedAt: { $max: "$updatedAt" },
            },
        },

        /* ---------- Shape response ---------- */
        {
            $project: {
                _id: 0,
                title: "$_id.title",
                category: "$_id.category",
                color: 1,
                usersCount: { $size: "$users" },
                averageGoal: {
                    $round: ["$avgGoalValue", 1],
                },
                goalUnit: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },

        /* ---------- Sorting ---------- */
        {
            $sort: {
                [sortBy]: sortBy === "title" ? 1 : -1,
            },
        },
    ]);

    return habits;
};