import { Request, Response } from 'express';
import bcypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { HTTPResponse, StatusCodes, handleErrorResponse, passwordEncypt } from '../utils/httpResponse';

export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const checkUser = await User.findOne({ email }) as User;

        if (!checkUser) {
            return HTTPResponse.NOT_FOUND(res, {
                status: StatusCodes.NOT_FOUND,
                message: "Invalid creditials",
            });
        }

        if (!bcypt.compareSync(password, checkUser?.password)) {
            return HTTPResponse.BAD_REQUEST(res, {
                status: StatusCodes.BAD_REQUEST,
                message: "INVALID_PASSWORD",
            });
        }

        const token = jwt.sign(
            { _id: checkUser._id },
            process.env.JWT_SECRET_KEY as jwt.Secret
        );

        return HTTPResponse.OK(res, {
            status: StatusCodes.OK,
            message: "USER_LOGIN",
            data: token,
        });

    } catch (e) {
        return handleErrorResponse(req, res, e as Error);
    }
}

export const Register = async (req: Request, res: Response) => {
    try {
        const { email, password, fullName } = req.body

        const checkEmail = await User.findOne({ email });

        if (checkEmail) {
            return HTTPResponse.BAD_REQUEST(res, {
                status: StatusCodes.BAD_REQUEST,
                message: "Email already exist",
            });
        }

        const passwordHash = await passwordEncypt(password);

        new User({ email, password: passwordHash, fullName }).save()
        return HTTPResponse.CREATED(res, {
            status: StatusCodes.CREATED,
            message: "USER_CREATED",
        });

    } catch (e) {
        return handleErrorResponse(req, res, e as Error);
    }
}