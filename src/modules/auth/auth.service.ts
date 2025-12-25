import User from "../user/user.model";
import bcrypt from "bcrypt";
import { DevicesType, IUserResponse } from "../user/user.types";
import { generateJwtToken } from "./auth.handler";

export const registerUser = async (
  fullName: string,
  email: string,
  password: string,
  device: DevicesType
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
    loginType: user.loginType,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const loginUser = async (
  email: string,
  password: string,
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

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    device: user.device,
    avatarUrl: user.avatarUrl,
    loginType: user.loginType,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const findOrCreateFirebaseUser = async (
  firebaseUser: any
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
    avatarUrl: user.avatarUrl,
    loginType: user.loginType,
    token,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

}
