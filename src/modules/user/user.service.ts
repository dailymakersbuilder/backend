import User, { IUser } from "./user.model"
import { IUserResponse } from "./user.types"

export const findByUserId = async (
    userId: string,
): Promise<IUserResponse | null> => {

    const user = await User.findById(userId)

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
        device: user.device,
        msgToken: user.msgToken,
        avatarUrl: user.avatarUrl,
        loginType: user.loginType,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}