import fs from "fs";
import { Request, Response } from "express";
import Brands, { IBrands } from "../models/Brands";
import { BrandResource } from "../resources/BrandResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
} from "../utils/httpResponse";
import { generateThumbnail, saveBase64Image } from "../utils/fileUpload";
import path from "path";
import {
  addBrandSchema,
  editBrandSchema,
} from "../validations/brandValidation";

export const getBrand = async (req: Request, res: Response) => {
  try {
    const query = { deleted: false } as any;

    const brands = await Brands.find(query);

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.brand.BRAND_LIST"),
      data: BrandResource(brands),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const addBrand = async (req: Request, res: Response) => {
  try {
    const { error, value } = addBrandSchema.validate(req.body);
    if (error) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }
    const { title, description, image } = value;

    let savedImagePath = "";
    let thumbnailPath = "";
    if (image) {
      savedImagePath = saveBase64Image(image, "brand_images");

      thumbnailPath = generateThumbnail(
        savedImagePath,
        "brand_images/thumbnails"
      );
    }

    const newBrand = await new Brands({
      title,
      description,
      image: savedImagePath,
      thumbnail: thumbnailPath,
      deleted: false,
    }).save();
    return HTTPResponse.CREATED(res, {
      status: StatusCodes.CREATED,
      message: res.__("messages.brand.BRAND_CREATED"),
      data: BrandResource(newBrand),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const editBrand = async (req: Request, res: Response) => {
  try {
    const { error, value } = editBrandSchema.validate(req.body);
    if (error) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }
    const { id, title, description, image } = value;

    const brand = await Brands.findById(id);
    if (!brand) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.brand.BRAND_NOT_FOUND"),
      });
    }

    let savedImagePath = brand.image;
    let thumbnailPath = brand.thumbnail;

    if (image) {
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
      savedImagePath = saveBase64Image(image, "brand_images");
      // Generate new thumbnail
      thumbnailPath = generateThumbnail(
        savedImagePath,
        "brand_images/thumbnails"
      );
    }

    // Build update object dynamically
    const updateData: any = {
      image: savedImagePath,
      thumbnail: thumbnailPath,
    };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    const updatedBrand = await Brands.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.brand.BRAND_UPDATED"),
      data: BrandResource(updatedBrand!),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brand = await Brands.findById(id);
    if (!brand || brand.deleted) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.brand.BRAND_NOT_FOUND"),
      });
    }
    // delete the image
    let savedImagePath = brand.image;
    let thumbnailPath = brand.thumbnail;
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

    brand.deleted = true;
    await brand.save();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.brand.BRAND_DELETED"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};
