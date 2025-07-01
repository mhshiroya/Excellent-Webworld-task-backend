import Joi from "joi";

export const addBrandSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.base": "Title must be a string",
  }),
  description: Joi.string().required().messages({
    "any.required": "Description is required",
    "string.base": "Description must be a string",
  }),
  image: Joi.string().optional().allow(null, "").messages({
    "string.base": "Image must be a string",
  }),
});
export const editBrandSchema = Joi.object({
  id: Joi.string().required().messages({
    "any.required": "ID is required",
    "string.base": "ID must be a string",
  }),
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.base": "Title must be a string",
  }),
  description: Joi.string().required().messages({
    "any.required": "Description is required",
    "string.base": "Description must be a string",
  }),
  image: Joi.string().optional().allow(null, "").messages({
    "string.base": "Image must be a string",
  }),
});
