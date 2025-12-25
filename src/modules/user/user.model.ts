import mongoose, { Schema, HydratedDocument } from "mongoose";
import type { DevicesType, LoginTypes } from "./user.types";

export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  firebaseUid?: string;
  device: DevicesType;
  avatarUrl?: string;
  loginType: LoginTypes;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: function(this: IUser) {
        return this.loginType === "standard";
      }
    },
    firebaseUid: {
      index: true,
      type: String,
      required: function(this: IUser) {
        return this.loginType === "google" || this.loginType === "apple";
      },
      unique: true,
      sparse: true,
    },
    device: {
      type: String,
      enum: ["android", "iphone", "web", "other"],
      required: true,
    },
    loginType: {
      type: String,
      enum: ["standard", "google", "apple"],
      default: "standard",
    },
    avatarUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", UserSchema);