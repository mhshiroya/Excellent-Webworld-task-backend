import fs from "fs";
import { Request, Response } from "express";
import Categories, { ICategories } from "../models/Categories";
import { CategoryResource } from "../resources/CategoryResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
} from "../utils/httpResponse";
import { generateThumbnail, saveBase64Image } from "../utils/fileUpload";
import path from "path";
import {
  addCategorySchema,
  editCategorySchema,
} from "../validations/categoryValidation";

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
    const { error, value } = addCategorySchema.validate(req.body);
    if (error) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }

    // Destructure validated data
    const { title, description, image } = value;

    let savedImagePath = "";
    let thumbnailPath = "";

    if (image && image.trim().startsWith("data:image")) {
      savedImagePath = saveBase64Image(image, "category_images");
      thumbnailPath = generateThumbnail(
        savedImagePath,
        "category_images/thumbnails"
      );
    }

    const newCategory = await new Categories({
      title,
      description,
      image: savedImagePath,
      thumbnail: thumbnailPath,
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
    const { error, value } = editCategorySchema.validate(req.body);
    if (error) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }
    const { id, title, description, image } = value;

    const category = await Categories.findById(id);
    if (!category) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.category.CATEGORY_NOT_FOUND"),
      });
    }

    let savedImagePath = category.image;
    let thumbnailPath = category.thumbnail;

    if (
      image &&
      typeof image === "string" &&
      image.trim().startsWith("data:image")
    ) {
      // Delete old image
      if (savedImagePath) {
        const oldPath = path.join(process.cwd(), savedImagePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      if (thumbnailPath) {
        const oldThumbPath = path.join(process.cwd(), thumbnailPath);
        if (fs.existsSync(oldThumbPath)) {
          fs.unlinkSync(oldThumbPath);
        }
      }

      // Save new image
      savedImagePath = saveBase64Image(image, "category_images");
      // Generate new thumbnail
      thumbnailPath = generateThumbnail(
        savedImagePath,
        "category_images/thumbnails"
      );
    }

    // Build update object dynamically
    const updateData: any = {
      image: savedImagePath,
      thumbnail: thumbnailPath,
    };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updatedCategory = await Categories.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.category.CATEGORY_UPDATED"),
      data: CategoryResource(updatedCategory!),
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

    // delete the image
    let savedImagePath = category.image;
    let thumbnailPath = category.thumbnail;
    if (savedImagePath) {
      const oldPath = path.join(process.cwd(), savedImagePath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    if (thumbnailPath) {
      const oldThumbPath = path.join(process.cwd(), thumbnailPath);
      if (fs.existsSync(oldThumbPath)) {
        fs.unlinkSync(oldThumbPath);
      }
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
