import Notification from "./notification.model";

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    link?: string
) => {
    const notification = new Notification({
        userId,
        title,
        message,
        link,
    });
    await notification.save();
    return notification;
}

export const markNotificationAsRead = async (notificationId: string) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );
    return notification;
}

export const getUserNotifications = async (
    userId: string,
    limit: number = 20,
    skip: number = 0,
    unread: boolean = false
) => {
    const query: any = { userId };
    if (unread) {
        query.read = false;
    }
    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return notifications;
}

export const getUnreadNotificationCount = async (userId: string) => {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
}