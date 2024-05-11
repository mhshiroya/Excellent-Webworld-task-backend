import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { HTTPResponse, StatusCodes, handleErrorResponse } from '../utils/httpResponse';

export const verifyUserToken = async (
    req: any,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    const token = (req.headers.token as string) || undefined;
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        const verified =
            jwt.verify(
                token,
                process.env.JWT_SECRET_KEY as jwt.Secret
            );
        if (!verified) {
            return HTTPResponse.UNAUTHORIZED(res, {
                status: StatusCodes.UNAUTHORIZED,
                message: "INVALID_TOKEN",
            });
        }

        req.user = verified;
        next();
    } catch (error) {
        return handleErrorResponse(req, res, error as Error);
    }
};
