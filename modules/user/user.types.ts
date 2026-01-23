export type DevicesType = "android" | "iphone" | "web" | "other";

export type LoginTypes = "standard" | "google" | "apple";

export interface IUserResponse {
  id: string;
  fullName: string;
  email: string;
  device: DevicesType;
  avatarUrl?: string;
  msgToken: string;
  loginType: LoginTypes;
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  token?: string;
  preferences?: Record<string, any>;
}