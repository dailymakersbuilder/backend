import mongoose, { HydratedDocument, Schema } from "mongoose";

export interface INotification {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string;
}

export type NotificationDocument = HydratedDocument<INotification>;

const NotificationSchema = new Schema(
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
        message: {
            type: String,
            required: true,
            trim: true,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        link: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: false,
    }
);


export default mongoose.model<NotificationDocument>(
    "Notification",
    NotificationSchema
);