import Joi from "joi";

export const addProductSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.base": "Title must be a string",
  }),
  description: Joi.string().required().messages({
    "any.required": "Description is required",
    "string.base": "Description must be a string",
  }),
  price: Joi.number().required().messages({
    "any.required": "Price is required",
    "number.base": "Price must be a number",
  }),
  discountPercentage: Joi.number().required().min(0).max(100).messages({
    "any.required": "Discount percentage is required",
    "number.base": "Discount percentage must be a number",
    "number.min": "Discount percentage cannot be negative",
    "number.max": "Discount percentage cannot exceed 100",
  }),
  rating: Joi.number().required().min(0).max(5).messages({
    "any.required": "Rating is required",
    "number.base": "Rating must be a number",
    "number.min": "Rating must be at least 0",
    "number.max": "Rating cannot exceed 5",
  }),
  stock: Joi.number().required().messages({
    "any.required": "Stock is required",
    "number.base": "Stock must be a number",
  }),
  brand_id: Joi.string().required().messages({
    "any.required": "Brand ID is required",
    "string.base": "Brand ID must be a string",
  }),
  category_id: Joi.string().required().messages({
    "any.required": "Category ID is required",
    "string.base": "Category ID must be a string",
  }),
  images: Joi.array()
    .items(
      Joi.string().messages({
        "string.base": "Each image must be a string",
      })
    )
    .optional()
    .messages({
      "array.base": "Images must be an array of strings",
    }),
});
