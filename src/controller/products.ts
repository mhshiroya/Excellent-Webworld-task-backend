import fs from "fs";
import { Request, Response } from "express";
import Products, { IProduct } from "../models/Products";
import { saveBase64Image } from "../utils/fileUpload";
import { ProductResource } from "../resources/ProductResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
} from "../utils/httpResponse";
import { addProductSchema } from "../validations/productValidation";
import path from "path";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { selectedCategory, price, page = 1, limit = 3 } = req.body;

    const query = { deleted: false } as any;

    if (selectedCategory) {
      query.category_id = selectedCategory;
    }

    const sortField = "_id";
    const sortOrder = -1;

    // Convert page/limit to numbers
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination meta
    const total = await Products.countDocuments(query);

    const products = await Products.find(query)
      .sort({
        [sortField]: sortOrder,
      })
      .skip(skip)
      .limit(limitNum)
      .populate("category_id", "title description")
      .populate("brand_id", "title description")
      .lean();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.product.PRODUCT_LIST"),
      data: {
        products: ProductResource(products),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { error, value } = addProductSchema.validate(req.body);
    if (error) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: error.details[0].message,
      });
    }
    const {
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand_id,
      category_id,
      images,
    } = value;

    if (images && !Array.isArray(images)) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.product.FIELD_IMAGES_MUST_BE_ARRAY"),
      });
    }

    const savedImagePaths: string[] = [];
    if (Array.isArray(images)) {
      for (const img of images) {
        if (typeof img === "string" && img.trim()) {
          const saved = saveBase64Image(img, "product_images");
          savedImagePaths.push(saved);
        }
      }
    }

    const newProduct = await new Products({
      title,
      description,
      price,
      discountPercentage,
      rating,
      stock,
      brand_id,
      category_id,
      images: savedImagePaths,
      deleted: false,
    }).save();

    return HTTPResponse.CREATED(res, {
      status: StatusCodes.CREATED,
      message: res.__("messages.product.PRODUCT_CREATED"),
      data: ProductResource(newProduct),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Products.findById(id);
    if (!product || product.deleted) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.product.PRODUCT_NOT_FOUND"),
      });
    }

    // Unlink each image file
    if (Array.isArray(product.images)) {
      product.images.forEach((imgPath) => {
        const fullPath = path.join(process.cwd(), imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlink(fullPath, (err) => {
            if (err) {
              console.error(`Failed to delete image: ${fullPath}`, err);
            } else {
              console.log(`Deleted image: ${fullPath}`);
            }
          });
        } else {
          console.warn(`Image file not found: ${fullPath}`);
        }
      });
    }

    product.deleted = true;
    await product.save();

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.product.PRODUCT_DELETED"),
    });
  } catch (e) {
    return handleErrorResponse(req, res, e as Error);
  }
};
