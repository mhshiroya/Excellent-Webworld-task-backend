import { Request, Response } from "express";
import bcypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { saveBase64Image } from "../utils/fileUpload";
import User, { IUser } from "../models/User";
import { sendEmail } from "../utils/mailer";
import crypto from "crypto";

import { UserResource } from "../resources/UserResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
  passwordEncypt,
} from "../utils/httpResponse";

export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const checkUser = (await User.findOne({ email })) as IUser;

    if (!checkUser) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.auth.INVALID_DATA"),
      });
    }

    if (!bcypt.compareSync(password, checkUser?.password)) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.INVALID_PASSWORD"),
      });
    }

    const token = jwt.sign(
      { _id: checkUser._id },
      process.env.JWT_SECRET_KEY as jwt.Secret
    );

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.auth.USER_LOGIN"),
      data: {
        user: UserResource(checkUser),
        token,
      },
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    const checkEmail = await User.findOne({ email });

    if (checkEmail) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.EMAIL_ALREADY_EXISTS"),
      });
    }
    const passwordHash = await passwordEncypt(password);

    const user = await new User({
      email,
      password: passwordHash,
      fullName,
    }).save();

    // Send welcome email
    const templatePath = path.join(
      __dirname,
      "../templates/registrationEmail.html"
    );
    let htmlContent = fs.readFileSync(templatePath, "utf-8");
    htmlContent = htmlContent.replace(/{{name}}/g, fullName);
    htmlContent = htmlContent.replace(/{{app_name}}/g, "myapp");
    htmlContent = htmlContent.replace(
      /{{year}}/g,
      new Date().getFullYear().toString()
    );

    await sendEmail(
      email,
      htmlContent,
      process.env.APP_NAME + ": Register Welcome Email"
    );

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET_KEY as jwt.Secret
    );
    return HTTPResponse.CREATED(res, {
      status: StatusCodes.CREATED,
      message: res.__("messages.auth.USER_CREATED"),
      data: { token, user },
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("messages.auth.USER_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("messages.auth.PROFILE_DATA"),
      data: UserResource(user),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, userId, image } = req.body;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    if (image) {
      updateData.profileImage = saveBase64Image(image, "profile_images");
    }
    console.log(updateData);
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: res.__("messages.auth.USER_NOT_FOUND"),
      });
    }

    return res.status(StatusCodes.OK).json({
      status: true,
      message: res.__("messages.auth.PROFILE_UPDATED"),
      data: UserResource(user),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword, userId } = req.body;

    if (!oldPassword || !newPassword) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.OLD_AND_NEW_PASSWORD_REQUIRED"),
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.auth.USER_NOT_FOUND"),
      });
    }

    // Check old password
    const isMatch = await bcypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return HTTPResponse.UNAUTHORIZED(res, {
        status: StatusCodes.UNAUTHORIZED,
        message: res.__("messages.auth.OLD_PASSWORD_INCORRECT"),
      });
    }

    // Check old != new
    const isSame = await bcypt.compare(newPassword, user.password);
    if (isSame) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.NEW_PASSWORD_SAME_AS_OLD"),
      });
    }

    // Validate new password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.PASSWORD_NOT_MATCH_CREATIREA"),
      });
    }

    // Hash and update
    const salt = await bcypt.genSalt(10);
    user.password = await bcypt.hash(newPassword, salt);
    await user.save();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.auth.PASSWORD_UPDATED_SUCCESSFULLY"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.EMAIL_REQUIRED"),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.auth.USER_NOT_FOUND"),
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiry;
    await user.save();

    // Send  email

    const resetLink = `https://www.google.com/reset-password?token=${token}`;

    const templatePath = path.join(
      __dirname,
      "../templates/forgotPasswordEmail.html"
    );
    let htmlContent = fs.readFileSync(templatePath, "utf-8");
    htmlContent = htmlContent.replace(/{{name}}/g, user.fullName);
    htmlContent = htmlContent.replace(/{{resetLink}}/g, resetLink);
    htmlContent = htmlContent.replace(/{{app_name}}/g, "myapp");
    htmlContent = htmlContent.replace(
      /{{year}}/g,
      new Date().getFullYear().toString()
    );
    await sendEmail(
      email,
      htmlContent,
      process.env.APP_NAME + ": Forgot Password Email"
    );

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.auth.RESET_LINK_SET"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.TOKEN_AND_PASSWORD_REQUIRED"),
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.TOKEN_AND_PASSWORD_REQUIRED"),
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.auth.PASSWORD_NOT_MATCH_CREATIREA"),
      });
    }

    // Update password
    const salt = await bcypt.genSalt(10);
    user.password = await bcypt.hash(newPassword, salt);

    // Invalidate token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.auth.PASSWORD_RESET_SUCCESSFUL"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};
