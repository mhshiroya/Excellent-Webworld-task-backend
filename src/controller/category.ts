import { Request, Response } from "express";
import Categories, { ICategories } from "../models/Categories";

import { CategoryResource } from "../resources/CategoryResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
} from "../utils/httpResponse";

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { selectedCategory } = req.body;

    const query = { deleted: false } as any;

    if (selectedCategory) {
      query.category = selectedCategory;
    }

    const categories = await Categories.find(query);

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.category.CATEGORY_LIST"),
      data: CategoryResource(categories),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { title, description, images } = req.body;
    console.log(req.body);

    const newCategory = await new Categories({
      title,
      description,
      images,
      deleted: false,
    }).save();
    return HTTPResponse.CREATED(res, {
      status: StatusCodes.CREATED,
      message: res.__("messages.category.CATEGORY_CREATED"),
      data: CategoryResource(newCategory),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const editCategory = async (req: Request, res: Response) => {
  try {
    const { id, title, description, images } = req.body;

    if (!id) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.category.ID_REQUIRED"),
      });
    }

    const updatedCategory = await Categories.findByIdAndUpdate(
      id,
      {
        title,
        description,
        images,
      },
      { new: true } // Return updated document
    );

    if (!updatedCategory) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.category.CATEGORY_NOT_FOUND"),
      });
    }

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.category.CATEGORY_UPDATED"),
      data: CategoryResource(updatedCategory),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Categories.findById(id);
    if (!category || category.deleted) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.category.CATEGORY_NOT_FOUND"),
      });
    }

    category.deleted = true;
    await category.save();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.category.CATEGORY_DELETED"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};
