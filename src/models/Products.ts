import { Schema, model, Document } from "mongoose";
import { Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  category_id: Types.ObjectId;
  brand_id: Types.ObjectId;
  images: string[];
  deleted: boolean;
}

const productSchema: Schema<IProduct> = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  rating: { type: Number, required: true },
  stock: { type: Number, required: true },
  brand_id: {
    type: Schema.Types.ObjectId,
    ref: "brands",
    required: true,
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  images: [{ type: String, required: true }],
  deleted: { type: Boolean, default: false },
});

const Product = model<IProduct>("Product", productSchema);

export default Product;
