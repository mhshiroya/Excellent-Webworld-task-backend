import { IUser } from "../models/User"; // your user interface

export const UserResource = (user: IUser) => {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    profileImage: user.profileImage
      ? `${process.env.BASE_URL}` + user.profileImage
      : null,
    createdAt: user.createdAt,
  };
};
