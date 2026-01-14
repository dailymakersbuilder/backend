import User from "../user/user.model";
import Otp from "./otp.model";
import { IOtp } from "./otp.model";
import bcrypt from "bcrypt";
import { DevicesType, IUserResponse } from "../user/user.types";
import { generateJwtToken, generateOTP } from "./auth.handler";

export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  device: DevicesType,
  msgToken: string,
): Promise<IUserResponse> => {

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPass = bcrypt.hashSync(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPass,
    device,
    msgToken,
  });

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = generateJwtToken({ id: user._id });

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    device: user.device,
    avatarUrl: user.avatarUrl,
    msgToken: user.msgToken,
    loginType: user.loginType,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const loginUser = async (
  email: string,
  password: string,
  msgToken?: string,
): Promise<IUserResponse> => {

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password!);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = generateJwtToken({ id: user._id });

  if (msgToken) {
    user.msgToken = msgToken;
    await user.save();
  }

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    device: user.device,
    avatarUrl: user.avatarUrl,
    msgToken: user.msgToken,
    loginType: user.loginType,
    token,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const findOrCreateFirebaseUser = async (
  firebaseUser: any,
  msgToken: string,
): Promise<IUserResponse> => {

  let user = await User.findOne({ firebaseUid: firebaseUser.uid });

  if (!user) {
    const providerData = firebaseUser.providerData?.[0];
    const provider = providerData?.providerId || 'unknown';

    user = await User.create({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      avatarUrl: firebaseUser.photoURL,
      msgToken,
      loginType: provider.includes('google') ? 'google' : provider.includes('apple') ? 'apple' : 'standard',
      device: provider.includes('android') ? 'android' : provider.includes('iphone') ? 'iphone' : 'web',
    });
  }
  const token = generateJwtToken({ id: user._id });

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    device: user.device,
    msgToken: user.msgToken,
    avatarUrl: user.avatarUrl,
    loginType: user.loginType,
    phone: user.phone,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

}

export const sendOTP =
  async (email: string): Promise<IOtp> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const code = generateOTP();
    const generatedCode = await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) },
      { upsert: true, new: true }
    );

    if (!generatedCode) {
      throw new Error("Failed to generate OTP");
    }

    return generatedCode;
  };

export const verifyOTP =
  async (email: string, code: string): Promise<boolean> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const otpRecord = await Otp.findOne({ email, code });
    if (!otpRecord) {
      throw new Error("Invalid OTP");
    }
    if (otpRecord.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }
    if (user) {
      user.otpVerified = true;
      await user.save();
    }
    await Otp.deleteOne({ _id: otpRecord._id });
    return true;
  }

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  if (user?.otpVerified !== true) {
    throw new Error("OTP not verified for this user");
  }
  const hashedPass = bcrypt.hashSync(newPassword, 10);
  user.password = hashedPass;
  user.otpVerified = false;
  await user.save();
};