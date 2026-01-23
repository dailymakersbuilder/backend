import User, { IUser } from "./user.model"
import { IUserResponse } from "./user.types"

export const findByUserId = async (
    userId: string,
): Promise<IUserResponse | null> => {

    const query = { _id: userId, isDeleted: { $ne: true } };
    const user = await User.findById(query)

    if (!user) {
        throw new Error("User not found")
    }

    return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        device: user.device,
        msgToken: user.msgToken,
        avatarUrl: user.avatarUrl,
        loginType: user.loginType,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export const updateUser = async (
    userId: string,
    updateData: Partial<IUser>,
): Promise<IUserResponse | null> => {

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
    )
    if (!user) {
        throw new Error("User not found")
    }
    return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        device: user.device,
        msgToken: user.msgToken,
        avatarUrl: user.avatarUrl,
        loginType: user.loginType,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export const updatePreferences = async (
    userId: string,
    preferences: Record<string, any>,
): Promise<IUserResponse | null> => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
    )
    
    if (!user) {
        throw new Error("User not found")
    }
    return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        device: user.device,
        msgToken: user.msgToken,
        avatarUrl: user.avatarUrl,
        loginType: user.loginType,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

export const softDeleteUser = async (
    userId: string,
): Promise<void> => {
    await User.findByIdAndUpdate(
        userId,
        { $set: { isDeleted: true } },
    )
}
