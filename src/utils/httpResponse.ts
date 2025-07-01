import { Request, Response } from "express";
import bcrypt from "bcrypt";

const StatusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  METHOD_NOT_ALLOWED: 405,
  VALIDATION_ERROR: 422,
};

const HTTPResponse = {
  OK: (res: Response, data: object) => {
    res.status(StatusCodes.OK).json(data);
  },

  METHOD_NOT_ALLOWED: (res: Response, data: object) => {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).json(data);
  },

  CREATED: (res: Response, data: object) => {
    res.status(StatusCodes.CREATED).json(data);
  },

  BAD_REQUEST: (res: Response, data: object) => {
    res.status(StatusCodes.BAD_REQUEST).json(data);
  },

  UNAUTHORIZED: (res: Response, data: object) => {
    res.status(StatusCodes.UNAUTHORIZED).json(data);
  },

  FORBIDDEN: (res: Response, data: object) => {
    res.status(StatusCodes.FORBIDDEN).json(data);
  },

  NOT_FOUND: (res: Response, data: object) => {
    res.status(StatusCodes.NOT_FOUND).json(data);
  },

  INTERNAL_SERVER_ERROR: (res: Response, data: object) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(data);
  },
};

function handleErrorResponse(req: Request, res: Response, error: Error) {
  return res.status(500).json({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "INTERNAL_SERVER_ERROR",
    data: error.message,
  });
}

export const passwordEncypt = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = bcrypt.hash(password, salt);
  return passwordHash;
};

export { HTTPResponse, StatusCodes, handleErrorResponse };
