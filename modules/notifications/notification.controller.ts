import { Request, Response, NextFunction } from "express";
import {
    createNotification,
    markNotificationAsRead,
    getUserNotifications,
    getUnreadNotificationCount
} from "./notification.service";

interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const createNotificationHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const { title, message, link } = req.body;
        const notification = await createNotification(
            req.user.id,
            title,
            message,
            link
        );
        res.status(201).json(notification);
    }
    catch (error) {
        next(error);
    }
};

export const markNotificationAsReadHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {   
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const { notificationId } = req.params;
        const notification = await markNotificationAsRead(notificationId);
        res.status(200).json(notification);
    }
    catch (error) {
        next(error);
    }
};

export const getUserNotificationsHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const limit = parseInt(req.params.limit as string) || 20;
        const skip = parseInt(req.params.skip as string) || 0;
        const unread = req.query.unread === 'true' ? true : false;
        const notifications = await getUserNotifications(   
            req.user.id,
            limit,
            skip,
            unread
        );
        res.status(200).json(notifications);
    }
    catch (error) {
        next(error);
    }
};
export const getUnreadNotificationCountHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user?.id) {
            throw new Error("User is not authenticated");
        }
        const count = await getUnreadNotificationCount(req.user.id);
        res.status(200).json({ unreadCount: count });
    }
    catch (error) {
        next(error);
    }
};
