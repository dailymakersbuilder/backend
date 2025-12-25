export type DevicesType = "android" | "iphone" | "web" | "other";

export type LoginTypes = "standard" | "google" | "apple";

export interface IUserResponse {
  id: string;
  fullName: string;
  email: string;
  device: DevicesType;
  avatarUrl?: string;
  loginType: LoginTypes;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
}