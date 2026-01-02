import mongoose, { HydratedDocument, Schema } from 'mongoose';

export interface IOtp {
    email: string;
    code: string;
    expiresAt: Date;
}

export type OtpDocument = HydratedDocument<IOtp>;

const OtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 5 * 60 * 1000),
            expires: 0,
        },
    },
    { timestamps: true }
);

export default mongoose.model<OtpDocument>("Otp", OtpSchema);