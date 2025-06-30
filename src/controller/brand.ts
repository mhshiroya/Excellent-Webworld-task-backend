import { Request, Response } from "express";
import Brands, { IBrands } from "../models/Brands";

import { BrandResource } from "../resources/BrandResource";
import {
  HTTPResponse,
  StatusCodes,
  handleErrorResponse,
} from "../utils/httpResponse";

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
    const { title, description, images } = req.body;
    console.log(req.body);

    const newBrand = await new Brands({
      title,
      description,
      images,
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
    const { id, title, description, images } = req.body;

    if (!id) {
      return HTTPResponse.BAD_REQUEST(res, {
        status: StatusCodes.BAD_REQUEST,
        message: res.__("messages.brand.ID_REQUIRED"),
      });
    }

    const updatedBrand = await Brands.findByIdAndUpdate(
      id,
      {
        title,
        description,
        images,
      },
      { new: true } // Return updated document
    );

    if (!updatedBrand) {
      return HTTPResponse.NOT_FOUND(res, {
        status: StatusCodes.NOT_FOUND,
        message: res.__("messages.brand.BRAND_NOT_FOUND"),
      });
    }

    return HTTPResponse.OK(res, {
      status: StatusCodes.OK,
      message: res.__("messages.brand.BRAND_UPDATED"),
      data: BrandResource(updatedBrand),
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
